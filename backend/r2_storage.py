# Cloudflare R2 对象存储配置脚本
"""
PartyOnce R2 对象存储模块
提供文件上传、Presign URL 生成、文件管理等功能
"""

import boto3
from botocore.config import Config
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
import uuid
import mimetypes

# R2 配置
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL", "")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "partymaster-uploads")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL", "")

# 文件类型白名单
ALLOWED_EXTENSIONS = {
    'image': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    'document': ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
    'video': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    'audio': ['.mp3', '.wav', '.ogg', '.m4a'],
}

# 文件大小限制（字节）
MAX_FILE_SIZE = {
    'image': 10 * 1024 * 1024,      # 10MB
    'document': 50 * 1024 * 1024,   # 50MB
    'video': 500 * 1024 * 1024,     # 500MB
    'audio': 50 * 1024 * 1024,      # 50MB
}


def get_r2_client():
    """
    创建 R2 S3 客户端
    """
    if not all([R2_ENDPOINT_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY]):
        raise ValueError("R2 configuration incomplete. Please check environment variables.")
    
    config = Config(
        signature_version='v4',
        retries={'max_attempts': 3}
    )
    
    client = boto3.client(
        's3',
        endpoint_url=R2_ENDPOINT_URL,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        config=config,
        region_name='auto'  # R2 不需要指定 region
    )
    
    return client


def get_file_category(filename: str) -> str:
    """
    根据文件名判断文件类别
    """
    ext = os.path.splitext(filename.lower())[1]
    
    for category, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return category
    
    return 'other'


def validate_file(filename: str, file_size: int) -> tuple[bool, str]:
    """
    验证文件类型和大小
    
    Returns:
        (is_valid, error_message)
    """
    # 检查文件扩展名
    ext = os.path.splitext(filename.lower())[1]
    
    allowed_all = []
    for extensions in ALLOWED_EXTENSIONS.values():
        allowed_all.extend(extensions)
    
    if ext not in allowed_all:
        return False, f"File type '{ext}' not allowed. Allowed types: {', '.join(allowed_all)}"
    
    # 检查文件大小
    category = get_file_category(filename)
    max_size = MAX_FILE_SIZE.get(category, 10 * 1024 * 1024)
    
    if file_size > max_size:
        return False, f"File too large. Max size for {category}: {max_size / (1024*1024):.1f}MB"
    
    return True, ""


def generate_unique_filename(original_filename: str, folder: str = "uploads") -> str:
    """
    生成唯一的文件名
    
    Args:
        original_filename: 原始文件名
        folder: 存储文件夹
    
    Returns:
        唯一的文件路径，格式: folder/YYYYMMDD/uuid-filename
    """
    ext = os.path.splitext(original_filename)[1].lower()
    unique_id = str(uuid.uuid4())[:8]
    date_folder = datetime.now().strftime("%Y%m%d")
    
    # 清理文件名（移除特殊字符）
    safe_name = "".join(c for c in original_filename if c.isalnum() or c in '-_.').strip()
    safe_name = safe_name[:50]  # 限制长度
    
    new_filename = f"{unique_id}-{safe_name}" if safe_name else f"{unique_id}{ext}"
    
    return f"{folder}/{date_folder}/{new_filename}"


def generate_presigned_upload_url(
    filename: str,
    content_type: Optional[str] = None,
    folder: str = "uploads",
    expires_in: int = 300,
    file_size: Optional[int] = None
) -> Dict[str, Any]:
    """
    生成 PUT Presign URL（用于前端直接上传到 R2）
    
    Args:
        filename: 原始文件名
        content_type: 文件 MIME 类型
        folder: 存储文件夹
        expires_in: URL 有效期（秒），默认 5 分钟
        file_size: 文件大小（用于验证）
    
    Returns:
        {
            "success": True,
            "upload_url": "https://...",  # PUT 上传 URL
            "public_url": "https://...",  # 文件访问 URL
            "key": "uploads/20240303/xxx-file.jpg",  # 存储路径
            "expires_in": 300
        }
    """
    try:
        # 验证文件
        if file_size:
            is_valid, error = validate_file(filename, file_size)
            if not is_valid:
                return {
                    "success": False,
                    "error": error
                }
        
        # 生成唯一文件名
        key = generate_unique_filename(filename, folder)
        
        # 检测 content type
        if not content_type:
            content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
        
        # 创建 R2 客户端
        s3 = get_r2_client()
        
        # 生成 Presign URL
        upload_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': R2_BUCKET_NAME,
                'Key': key,
                'ContentType': content_type,
            },
            ExpiresIn=expires_in
        )
        
        # 构建公共访问 URL
        if R2_PUBLIC_URL:
            public_url = f"{R2_PUBLIC_URL}/{key}"
        else:
            # 使用 R2 默认域名
            account_id = R2_ENDPOINT_URL.split('.')[0].split('//')[1]
            public_url = f"https://pub-{account_id}.r2.dev/{key}"
        
        return {
            "success": True,
            "upload_url": upload_url,
            "public_url": public_url,
            "key": key,
            "content_type": content_type,
            "expires_in": expires_in,
            "expires_at": (datetime.now() + timedelta(seconds=expires_in)).isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def generate_presigned_download_url(
    key: str,
    expires_in: int = 3600,
    filename: Optional[str] = None
) -> Dict[str, Any]:
    """
    生成 GET Presign URL（用于临时访问私有文件）
    
    Args:
        key: 文件在 R2 中的 key
        expires_in: URL 有效期（秒），默认 1 小时
        filename: 下载时显示的文件名（可选）
    
    Returns:
        {
            "success": True,
            "download_url": "https://...",
            "expires_in": 3600
        }
    """
    try:
        s3 = get_r2_client()
        
        params = {
            'Bucket': R2_BUCKET_NAME,
            'Key': key,
        }
        
        if filename:
            params['ResponseContentDisposition'] = f'attachment; filename="{filename}"'
        
        download_url = s3.generate_presigned_url(
            'get_object',
            Params=params,
            ExpiresIn=expires_in
        )
        
        return {
            "success": True,
            "download_url": download_url,
            "expires_in": expires_in,
            "expires_at": (datetime.now() + timedelta(seconds=expires_in)).isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def delete_file(key: str) -> Dict[str, Any]:
    """
    删除 R2 中的文件
    
    Args:
        key: 文件在 R2 中的 key
    
    Returns:
        {
            "success": True,
            "message": "File deleted successfully"
        }
    """
    try:
        s3 = get_r2_client()
        
        s3.delete_object(
            Bucket=R2_BUCKET_NAME,
            Key=key
        )
        
        return {
            "success": True,
            "message": "File deleted successfully",
            "key": key
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_file_info(key: str) -> Dict[str, Any]:
    """
    获取文件信息
    
    Args:
        key: 文件在 R2 中的 key
    
    Returns:
        {
            "success": True,
            "key": "uploads/20240303/xxx-file.jpg",
            "size": 12345,
            "content_type": "image/jpeg",
            "last_modified": "2024-03-03T12:00:00Z",
            "etag": "\"abc123...\"",
            "public_url": "https://..."
        }
    """
    try:
        s3 = get_r2_client()
        
        response = s3.head_object(
            Bucket=R2_BUCKET_NAME,
            Key=key
        )
        
        # 构建公共访问 URL
        if R2_PUBLIC_URL:
            public_url = f"{R2_PUBLIC_URL}/{key}"
        else:
            account_id = R2_ENDPOINT_URL.split('.')[0].split('//')[1]
            public_url = f"https://pub-{account_id}.r2.dev/{key}"
        
        return {
            "success": True,
            "key": key,
            "size": response.get('ContentLength', 0),
            "content_type": response.get('ContentType', 'application/octet-stream'),
            "last_modified": response.get('LastModified').isoformat() if response.get('LastModified') else None,
            "etag": response.get('ETag', ''),
            "public_url": public_url
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def list_files(
    prefix: str = "",
    max_keys: int = 1000
) -> Dict[str, Any]:
    """
    列出存储桶中的文件
    
    Args:
        prefix: 文件前缀（文件夹路径）
        max_keys: 最大返回数量
    
    Returns:
        {
            "success": True,
            "files": [
                {
                    "key": "uploads/20240303/file.jpg",
                    "size": 12345,
                    "last_modified": "2024-03-03T12:00:00Z"
                }
            ],
            "total": 1
        }
    """
    try:
        s3 = get_r2_client()
        
        response = s3.list_objects_v2(
            Bucket=R2_BUCKET_NAME,
            Prefix=prefix,
            MaxKeys=max_keys
        )
        
        files = []
        for obj in response.get('Contents', []):
            files.append({
                "key": obj['Key'],
                "size": obj['Size'],
                "last_modified": obj['LastModified'].isoformat()
            })
        
        return {
            "success": True,
            "files": files,
            "total": len(files),
            "prefix": prefix
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ==================== FastAPI 集成示例 ====================

"""
在 main.py 中添加上传相关 API：

```python
from fastapi import APIRouter, UploadFile, File
from r2_storage import (
    generate_presigned_upload_url,
    generate_presigned_download_url,
    delete_file,
    get_file_info,
    validate_file
)

# 获取上传 URL
@app.post("/api/upload/url")
def get_upload_url(
    filename: str,
    content_type: Optional[str] = None,
    folder: str = "uploads",
    file_size: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    \"\"\"获取文件上传 Presign URL\"\"\"
    result = generate_presigned_upload_url(
        filename=filename,
        content_type=content_type,
        folder=folder,
        file_size=file_size
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

# 获取下载 URL
@app.get("/api/download/{key:path}")
def get_download_url(
    key: str,
    expires_in: int = 3600,
    current_user: User = Depends(get_current_user)
):
    \"\"\"获取文件下载 Presign URL\"\"\"
    result = generate_presigned_download_url(key, expires_in)
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result

# 删除文件
@app.delete("/api/files/{key:path}")
def delete_uploaded_file(
    key: str,
    current_user: User = Depends(get_current_user)
):
    \"\"\"删除已上传的文件\"\"\"
    result = delete_file(key)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

# 获取文件信息
@app.get("/api/files/{key:path}/info")
def get_uploaded_file_info(
    key: str,
    current_user: User = Depends(get_current_user)
):
    \"\"\"获取文件信息\"\"\"
    result = get_file_info(key)
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result
```
"""

# ==================== 测试脚本 ====================

if __name__ == "__main__":
    """测试 R2 连接和功能"""
    
    print("=" * 50)
    print("Cloudflare R2 存储测试")
    print("=" * 50)
    
    # 检查配置
    print("\n1. 检查配置...")
    if not all([R2_ENDPOINT_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME]):
        print("❌ 配置不完整！请设置以下环境变量：")
        print("   - R2_ENDPOINT_URL")
        print("   - R2_ACCESS_KEY_ID")
        print("   - R2_SECRET_ACCESS_KEY")
        print("   - R2_BUCKET_NAME")
        exit(1)
    
    print("✅ 配置检查通过")
    print(f"   Bucket: {R2_BUCKET_NAME}")
    print(f"   Endpoint: {R2_ENDPOINT_URL}")
    
    # 测试连接
    print("\n2. 测试连接...")
    try:
        s3 = get_r2_client()
        s3.head_bucket(Bucket=R2_BUCKET_NAME)
        print("✅ 连接成功")
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        exit(1)
    
    # 测试生成上传 URL
    print("\n3. 测试生成 Presign URL...")
    result = generate_presigned_upload_url(
        filename="test-image.png",
        content_type="image/png",
        folder="test",
        expires_in=300
    )
    
    if result["success"]:
        print("✅ URL 生成成功")
        print(f"   Key: {result['key']}")
        print(f"   Public URL: {result['public_url']}")
        print(f"   Expires: {result['expires_at']}")
        
        # 保存测试文件信息用于清理
        test_key = result['key']
        
        # 测试获取文件信息（应该不存在）
        print("\n4. 测试获取文件信息...")
        info = get_file_info(test_key)
        if info["success"]:
            print("✅ 文件存在")
            print(f"   Size: {info['size']} bytes")
        else:
            print("ℹ️ 文件不存在（预期）")
        
        # 测试列出文件
        print("\n5. 测试列出文件...")
        files = list_files(prefix="test/")
        if files["success"]:
            print(f"✅ 找到 {files['total']} 个文件")
        else:
            print(f"❌ 列出失败: {files['error']}")
        
        print("\n" + "=" * 50)
        print("所有测试完成！")
        print("=" * 50)
        
    else:
        print(f"❌ URL 生成失败: {result['error']}")
        exit(1)
