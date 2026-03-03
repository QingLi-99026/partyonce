"""
PartyOnce Phase 1-4 API Extensions
Supplier Portal + Media Library + Templates + Events + Shares + Wallet
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import boto3
import os
import uuid
from botocore.config import Config

from main import get_db, get_current_user, User

router = APIRouter(prefix="/api", tags=["partyonce-ext"])

# ==================== 配置 ====================
R2_ENDPOINT = os.getenv("R2_ENDPOINT_URL", "https://your-account.r2.cloudflarestorage.com")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET = os.getenv("R2_BUCKET_NAME", "partyonce-media")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL", "https://cdn.partyonce.au")

# S3客户端（用于Cloudflare R2）
s3_client = boto3.client(
    's3',
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    config=Config(signature_version='s3v4')
) if R2_ACCESS_KEY else None

# ==================== 供应商相关模型 ====================

class PartnerCreate(BaseModel):
    company_name: str
    category: str
    contact_name: str
    contact_phone: str
    email: str
    service_area: Optional[str] = None
    abn_optional: Optional[str] = None

class PartnerResponse(BaseModel):
    id: int
    company_name: str
    category: str
    status: str
    created_at: datetime

class ContractAccept(BaseModel):
    contract_id: int

# ==================== 媒体相关模型 ====================

class MediaPresignRequest(BaseModel):
    filename: str
    mime_type: str
    size_bytes: int
    owner_type: str = "user"
    visibility: str = "private"

class MediaPresignResponse(BaseModel):
    upload_url: str
    storage_key: str
    public_url: Optional[str]

class MediaConfirmRequest(BaseModel):
    storage_key: str
    url: str
    media_type: str
    width: Optional[int] = None
    height: Optional[int] = None
    duration: Optional[int] = None
    size_bytes: int

class MediaResponse(BaseModel):
    id: int
    media_type: str
    url: str
    status: str
    created_at: datetime

# ==================== 模板相关模型 ====================

class TemplateResponse(BaseModel):
    id: int
    name: str
    scene_type: str
    budget_min: Optional[float]
    budget_max: Optional[float]
    cover_url: Optional[str]

class BindTemplateRequest(BaseModel):
    template_id: int

# ==================== 分享相关模型 ====================

class ShareCreateRequest(BaseModel):
    object_type: str  # event/template/case
    object_id: int
    channel: Optional[str] = "unknown"

class ShareResponse(BaseModel):
    share_code: str
    share_url: str

class ShareTrackRequest(BaseModel):
    event_type: str  # click/signup/deposit
    user_id: Optional[int] = None

# ==================== 供应商 API ====================

@router.post("/partners/apply", response_model=PartnerResponse)
def apply_partner(
    data: PartnerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """供应商申请入驻"""
    # 检查是否已有申请
    existing = db.execute(
        "SELECT id FROM partners WHERE user_id = %s",
        (current_user.id,)
    ).fetchone()
    
    if existing:
        raise HTTPException(status_code=400, detail="您已提交过申请")
    
    # 创建供应商记录
    result = db.execute("""
        INSERT INTO partners (user_id, company_name, category, contact_name, 
        contact_phone, email, service_area, abn_optional, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending')
    """, (
        current_user.id, data.company_name, data.category,
        data.contact_name, data.contact_phone, data.email,
        data.service_area, data.abn_optional
    ))
    
    db.commit()
    partner_id = result.lastrowid
    
    # 更新用户角色
    db.execute("UPDATE users SET role = 'supplier' WHERE id = %s", (current_user.id,))
    db.commit()
    
    return {
        "id": partner_id,
        "company_name": data.company_name,
        "category": data.category,
        "status": "pending",
        "created_at": datetime.now()
    }

@router.get("/partners/me")
def get_my_partner(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取我的供应商信息"""
    partner = db.execute("""
        SELECT p.*, COUNT(DISTINCT ma.id) as media_count
        FROM partners p
        LEFT JOIN media_assets ma ON ma.owner_id = p.id AND ma.owner_type = 'supplier'
        WHERE p.user_id = %s
        GROUP BY p.id
    """, (current_user.id,)).fetchone()
    
    if not partner:
        raise HTTPException(status_code=404, detail="未找到供应商信息")
    
    return dict(partner)

@router.get("/partner/contracts")
def get_partner_contracts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取合同列表"""
    # 获取供应商ID
    partner = db.execute(
        "SELECT id FROM partners WHERE user_id = %s",
        (current_user.id,)
    ).fetchone()
    
    if not partner:
        raise HTTPException(status_code=403, detail="您不是供应商")
    
    partner_id = partner[0]
    
    # 获取所有合同及签署状态
    contracts = db.execute("""
        SELECT c.*, 
               CASE WHEN ca.id IS NOT NULL THEN 'signed' ELSE 'unsigned' END as sign_status,
               ca.accepted_at
        FROM partner_contracts c
        LEFT JOIN partner_contract_acceptances ca 
            ON ca.contract_id = c.id AND ca.partner_id = %s
        WHERE c.status = 'active'
        ORDER BY c.created_at DESC
    """, (partner_id,)).fetchall()
    
    return [dict(c) for c in contracts]

@router.post("/partner/contracts/{contract_id}/accept")
def accept_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """确认签署合同"""
    # 获取供应商ID
    partner = db.execute(
        "SELECT id FROM partners WHERE user_id = %s",
        (current_user.id,)
    ).fetchone()
    
    if not partner:
        raise HTTPException(status_code=403, detail="您不是供应商")
    
    partner_id = partner[0]
    
    # 检查是否已签署
    existing = db.execute("""
        SELECT id FROM partner_contract_acceptances 
        WHERE partner_id = %s AND contract_id = %s
    """, (partner_id, contract_id)).fetchone()
    
    if existing:
        raise HTTPException(status_code=400, detail="您已签署此合同")
    
    # 获取合同版本
    contract = db.execute(
        "SELECT version FROM partner_contracts WHERE id = %s",
        (contract_id,)
    ).fetchone()
    
    if not contract:
        raise HTTPException(status_code=404, detail="合同不存在")
    
    # 创建签署记录
    db.execute("""
        INSERT INTO partner_contract_acceptances 
        (partner_id, contract_id, accepted_by_user_id, snapshot_version, ip_address)
        VALUES (%s, %s, %s, %s, %s)
    """, (partner_id, contract_id, current_user.id, contract[0], "0.0.0.0"))
    
    db.commit()
    
    return {"message": "合同签署成功"}

# ==================== Admin API ====================

@router.get("/admin/partners")
def admin_list_partners(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin: 供应商审核列表"""
    # 检查权限
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="无权限")
    
    query = """
        SELECT p.*, u.email as user_email
        FROM partners p
        JOIN users u ON p.user_id = u.id
    """
    params = ()
    
    if status:
        query += " WHERE p.status = %s"
        params = (status,)
    
    query += " ORDER BY p.created_at DESC"
    
    partners = db.execute(query, params).fetchall()
    return [dict(p) for p in partners]

@router.post("/admin/partners/{partner_id}/approve")
def admin_approve_partner(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin: 审核通过"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="无权限")
    
    db.execute(
        "UPDATE partners SET status = 'approved' WHERE id = %s",
        (partner_id,)
    )
    db.commit()
    
    return {"message": "审核通过"}

@router.post("/admin/partners/{partner_id}/reject")
def admin_reject_partner(
    partner_id: int,
    reason: Optional[str] = "不符合要求",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin: 审核拒绝"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="无权限")
    
    # 实际应用中应该有个字段存储拒绝原因
    db.execute(
        "UPDATE partners SET status = 'rejected' WHERE id = %s",
        (partner_id,)
    )
    db.commit()
    
    return {"message": f"已拒绝，原因：{reason}"}

# ==================== 媒体上传 API ====================

@router.post("/media/presign", response_model=MediaPresignResponse)
def get_media_presign_url(
    data: MediaPresignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取媒体上传预签名URL"""
    if not s3_client:
        raise HTTPException(status_code=500, detail="对象存储未配置")
    
    # 生成存储路径
    file_ext = data.filename.split('.')[-1]
    storage_key = f"{data.owner_type}/{current_user.id}/{uuid.uuid4()}.{file_ext}"
    
    try:
        # 生成预签名URL（5分钟有效期）
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': R2_BUCKET,
                'Key': storage_key,
                'ContentType': data.mime_type
            },
            ExpiresIn=300
        )
        
        public_url = f"{R2_PUBLIC_URL}/{storage_key}"
        
        return {
            "upload_url": presigned_url,
            "storage_key": storage_key,
            "public_url": public_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成上传链接失败: {str(e)}")

@router.post("/media/confirm")
def confirm_media_upload(
    data: MediaConfirmRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """确认媒体上传完成，写入数据库"""
    result = db.execute("""
        INSERT INTO media_assets 
        (owner_type, owner_id, media_type, mime_type, storage_key, url, 
         width, height, duration_sec, size_bytes, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'ready')
    """, (
        "user", current_user.id, data.media_type, 
        "image/jpeg" if data.media_type == "image" else "video/mp4",
        data.storage_key, data.url,
        data.width, data.height, data.duration, data.size_bytes
    ))
    
    db.commit()
    media_id = result.lastrowid
    
    return {"id": media_id, "status": "ready"}

@router.get("/partner/media")
def get_partner_media(
    media_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取供应商素材库"""
    partner = db.execute(
        "SELECT id FROM partners WHERE user_id = %s",
        (current_user.id,)
    ).fetchone()
    
    if not partner:
        raise HTTPException(status_code=403, detail="您不是供应商")
    
    query = "SELECT * FROM media_assets WHERE owner_type = 'supplier' AND owner_id = %s"
    params = [partner[0]]
    
    if media_type:
        query += " AND media_type = %s"
        params.append(media_type)
    
    query += " ORDER BY created_at DESC"
    
    media = db.execute(query, params).fetchall()
    return [dict(m) for m in media]

# ==================== 模板库 API ====================

@router.get("/templates", response_model=List[TemplateResponse])
def list_templates(
    scene_type: Optional[str] = None,
    budget_min: Optional[float] = None,
    budget_max: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """获取模板列表"""
    query = """
        SELECT t.*, ma.url as cover_url
        FROM templates t
        LEFT JOIN media_assets ma ON t.cover_media_id = ma.id
        WHERE t.status = 'active'
    """
    params = []
    
    if scene_type:
        query += " AND t.scene_type = %s"
        params.append(scene_type)
    
    if budget_min is not None:
        query += " AND t.budget_max >= %s"
        params.append(budget_min)
    
    if budget_max is not None:
        query += " AND t.budget_min <= %s"
        params.append(budget_max)
    
    query += " ORDER BY t.created_at DESC"
    
    templates = db.execute(query, params).fetchall()
    return [dict(t) for t in templates]

@router.get("/templates/{template_id}")
def get_template_detail(
    template_id: int,
    db: Session = Depends(get_db)
):
    """获取模板详情"""
    template = db.execute("""
        SELECT t.*, ma.url as cover_url
        FROM templates t
        LEFT JOIN media_assets ma ON t.cover_media_id = ma.id
        WHERE t.id = %s
    """, (template_id,)).fetchone()
    
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    # 获取物料清单
    bom = db.execute(
        "SELECT * FROM template_bom WHERE template_id = %s ORDER BY sort_order",
        (template_id,)
    ).fetchall()
    
    result = dict(template)
    result['bom'] = [dict(b) for b in bom]
    
    return result

@router.post("/orders/{order_id}/bind-template")
def bind_template_to_order(
    order_id: int,
    data: BindTemplateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """绑定模板到订单"""
    # 检查订单归属
    order = db.execute(
        "SELECT * FROM orders WHERE id = %s AND user_id = %s",
        (order_id, current_user.id)
    ).fetchone()
    
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    # 更新订单绑定模板
    db.execute(
        "UPDATE orders SET template_id = %s WHERE id = %s",
        (data.template_id, order_id)
    )
    db.commit()
    
    return {"message": "模板绑定成功"}

# ==================== 我的活动 API ====================

@router.get("/my/events")
def list_my_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取我的活动列表"""
    events = db.execute("""
        SELECT o.*, t.name as template_name, ma.url as template_cover
        FROM orders o
        LEFT JOIN templates t ON o.template_id = t.id
        LEFT JOIN media_assets ma ON t.cover_media_id = ma.id
        WHERE o.user_id = %s
        ORDER BY o.event_date DESC
    """, (current_user.id,)).fetchall()
    
    return [dict(e) for e in events]

@router.get("/my/events/{event_id}")
def get_event_detail(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取活动详情（含拍照指南和相册）"""
    # 活动基本信息
    event = db.execute("""
        SELECT o.*, t.name as template_name, t.scene_type, ma.url as template_cover
        FROM orders o
        LEFT JOIN templates t ON o.template_id = t.id
        LEFT JOIN media_assets ma ON t.cover_media_id = ma.id
        WHERE o.id = %s AND o.user_id = %s
    """, (event_id, current_user.id)).fetchone()
    
    if not event:
        raise HTTPException(status_code=404, detail="活动不存在")
    
    result = dict(event)
    
    # 拍照指南（根据场景类型生成）
    scene_type = result.get('scene_type', 'wedding')
    photo_guides = {
        'wedding': [
            {'position': '入口签到区', 'desc': '宾客签到合影'},
            {'position': '主仪式舞台', 'desc': '新人交换戒指'},
            {'position': '甜品台', 'desc': '蛋糕和甜点特写'},
            {'position': '合影背景墙', 'desc': '宾客合影互动'}
        ],
        'birthday': [
            {'position': '入口气球拱门', 'desc': '主题装饰全景'},
            {'position': '主背景板', 'desc': '生日主角特写'},
            {'position': '甜品台', 'desc': '蛋糕切蛋糕时刻'},
            {'position': '游戏互动区', 'desc': '宾客参与游戏'}
        ],
        'corporate': [
            {'position': '签到墙', 'desc': '嘉宾签到'},
            {'position': '主舞台', 'desc': '领导致辞'},
            {'position': '产品展示区', 'desc': '产品特写'},
            {'position': '圆桌讨论区', 'desc': '交流互动'}
        ]
    }
    result['photo_guide'] = photo_guides.get(scene_type, photo_guides['wedding'])
    
    # 活动相册
    albums = db.execute("""
        SELECT ea.*, ma.url, ma.media_type, ma.width, ma.height
        FROM event_albums ea
        JOIN media_assets ma ON ea.media_asset_id = ma.id
        WHERE ea.order_id = %s
        ORDER BY ea.created_at DESC
    """, (event_id,)).fetchall()
    
    result['album'] = [dict(a) for a in albums]
    
    return result

@router.post("/events/{event_id}/album")
def upload_to_event_album(
    event_id: int,
    media_id: int,
    caption: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """上传照片到活动相册"""
    # 验证活动归属
    event = db.execute(
        "SELECT id FROM orders WHERE id = %s AND user_id = %s",
        (event_id, current_user.id)
    ).fetchone()
    
    if not event:
        raise HTTPException(status_code=404, detail="活动不存在")
    
    # 创建相册记录
    db.execute("""
        INSERT INTO event_albums (order_id, media_asset_id, caption, uploaded_by_user_id)
        VALUES (%s, %s, %s, %s)
    """, (event_id, media_id, caption, current_user.id))
    
    db.commit()
    
    return {"message": "上传成功"}

# ==================== 分享链接 API ====================

@router.post("/shares", response_model=ShareResponse)
def create_share(
    data: ShareCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建分享链接"""
    # 生成短码
    share_code = uuid.uuid4().hex[:8]
    
    result = db.execute("""
        INSERT INTO shares (share_code, owner_user_id, object_type, object_id, channel)
        VALUES (%s, %s, %s, %s, %s)
    """, (share_code, current_user.id, data.object_type, data.object_id, data.channel))
    
    db.commit()
    
    return {
        "share_code": share_code,
        "share_url": f"https://partyonce.au/s/{share_code}"
    }

@router.get("/s/{share_code}")
def share_landing_page(
    share_code: str,
    db: Session = Depends(get_db)
):
    """H5分享落地页（记录点击）"""
    # 查找分享
    share = db.execute(
        "SELECT * FROM shares WHERE share_code = %s",
        (share_code,)
    ).fetchone()
    
    if not share:
        raise HTTPException(status_code=404, detail="分享不存在")
    
    # 记录点击事件
    db.execute("""
        INSERT INTO share_events (share_id, event_type, ip_address)
        VALUES (%s, 'click', %s)
    """, (share['id'], '0.0.0.0'))
    
    # 更新点击计数
    db.execute(
        "UPDATE shares SET click_count = click_count + 1 WHERE id = %s",
        (share['id'],)
    )
    
    db.commit()
    
    # 根据类型获取内容
    content = {}
    if share['object_type'] == 'event':
        # 获取活动信息
        event = db.execute("""
            SELECT o.*, t.name as template_name, ma.url as cover_url
            FROM orders o
            LEFT JOIN templates t ON o.template_id = t.id
            LEFT JOIN media_assets ma ON t.cover_media_id = ma.id
            WHERE o.id = %s
        """, (share['object_id'],)).fetchone()
        if event:
            content = dict(event)
    elif share['object_type'] == 'template':
        # 获取模板信息
        template = db.execute("""
            SELECT t.*, ma.url as cover_url
            FROM templates t
            LEFT JOIN media_assets ma ON t.cover_media_id = ma.id
            WHERE t.id = %s
        """, (share['object_id'],)).fetchone()
        if template:
            content = dict(template)
    
    return {
        "share_code": share_code,
        "object_type": share['object_type'],
        "content": content,
        "cta": {
            "app_installed": "partyonce://share/{}".format(share_code),
            "app_download": "https://partyonce.au/download"
        }
    }

@router.post("/shares/{share_code}/track")
def track_share_event(
    share_code: str,
    data: ShareTrackRequest,
    db: Session = Depends(get_db)
):
    """追踪分享事件（注册/成交）"""
    # 查找分享
    share = db.execute(
        "SELECT * FROM shares WHERE share_code = %s",
        (share_code,)
    ).fetchone()
    
    if not share:
        raise HTTPException(status_code=404, detail="分享不存在")
    
    # 记录事件
    db.execute("""
        INSERT INTO share_events (share_id, event_type, user_id, ip_address)
        VALUES (%s, %s, %s, %s)
    """, (share['id'], data.event_type, data.user_id, '0.0.0.0'))
    
    db.commit()
    
    # 如果是注册事件，建立推荐关系
    if data.event_type == 'signup' and data.user_id:
        db.execute("""
            INSERT INTO user_referrals (user_id, share_id, referrer_user_id)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE share_id = %s, referrer_user_id = %s
        """, (data.user_id, share['id'], share['owner_user_id'], share['id'], share['owner_user_id']))
        db.commit()
        
        # 触发注册奖励
        apply_reward(db, share['owner_user_id'], 'signup', share['id'])
    
    # 如果是成交事件，触发成交奖励
    if data.event_type == 'deposit' and data.user_id:
        apply_reward(db, share['owner_user_id'], 'deposit', share['id'])
    
    return {"message": "事件记录成功"}

# ==================== 钱包 API ====================

@router.get("/wallet")
def get_wallet(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取我的钱包"""
    wallet = db.execute(
        "SELECT * FROM wallets WHERE user_id = %s",
        (current_user.id,)
    ).fetchone()
    
    if not wallet:
        # 创建钱包
        db.execute(
            "INSERT INTO wallets (user_id, balance) VALUES (%s, 0.00)",
            (current_user.id,)
        )
        db.commit()
        wallet = db.execute(
            "SELECT * FROM wallets WHERE user_id = %s",
            (current_user.id,)
        ).fetchone()
    
    return dict(wallet)

@router.get("/wallet/ledger")
def get_wallet_ledger(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取钱包流水"""
    ledger = db.execute("""
        SELECT * FROM wallet_ledger 
        WHERE user_id = %s 
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
    """, (current_user.id, limit, offset)).fetchall()
    
    return [dict(l) for l in ledger]

# ==================== 工具函数 ====================

def apply_reward(db: Session, user_id: int, event_type: str, share_id: int):
    """应用返利规则"""
    # 查询规则
    rule = db.execute("""
        SELECT * FROM reward_rules 
        WHERE trigger_event_type = %s AND enabled = TRUE
    """, (event_type,)).fetchone()
    
    if not rule:
        return
    
    # 检查频控（简版）
    if rule['daily_cap']:
        today_count = db.execute("""
            SELECT COUNT(*) FROM wallet_ledger
            WHERE user_id = %s AND reason = %s AND DATE(created_at) = CURDATE()
        """, (user_id, f"{event_type}_bonus")).fetchone()[0]
        
        if today_count >= rule['daily_cap']:
            return
    
    # 写入流水
    db.execute("""
        INSERT INTO wallet_ledger 
        (user_id, amount, type, reason, reference_type, reference_id, status)
        VALUES (%s, %s, 'reward', %s, 'share_event', %s, 'paid')
    """, (user_id, rule['amount'], f"{event_type}_bonus", share_id))
    
    # 更新余额
    db.execute("""
        UPDATE wallets 
        SET balance = balance + %s, 
            total_earned = total_earned + %s
        WHERE user_id = %s
    """, (rule['amount'], rule['amount'], user_id))
    
    db.commit()

# 注意：需要将此router挂载到main.py中
# app.include_router(router)
