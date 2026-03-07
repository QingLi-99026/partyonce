#!/bin/bash
# PartyOnce 项目备份脚本
# 使用方法: bash backup-partyonce.sh

SOURCE_DIR="/Users/aiagentkevin/.openclaw/workspace/projects/PartyOnce"
BACKUP_DIR="/Volumes/LaCie/PartyOnce-Backup"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/backup.log"

# 检查移动硬盘是否存在
if [ ! -d "/Volumes/LaCie" ]; then
    echo "❌ 错误: 移动硬盘 LaCie 未连接!"
    echo "请插入移动硬盘后重试。"
    exit 1
fi

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "========================================" | tee -a "$LOG_FILE"
echo "PartyOnce 项目备份" | tee -a "$LOG_FILE"
echo "开始时间: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# 检查源目录
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ 错误: 源目录不存在: $SOURCE_DIR" | tee -a "$LOG_FILE"
    exit 1
fi

# 计算源目录大小
echo "📊 源目录大小:" | tee -a "$LOG_FILE"
du -sh "$SOURCE_DIR" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# 执行备份 (使用 rsync 进行增量备份)
echo "🔄 开始备份..." | tee -a "$LOG_FILE"
rsync -avh --progress \
    --exclude='.git/objects' \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='venv' \
    --exclude='.DS_Store' \
    "$SOURCE_DIR/" \
    "$BACKUP_DIR/current/" \
    2>> "$LOG_FILE"

RSYNC_EXIT=$?

# 创建版本快照
if [ $RSYNC_EXIT -eq 0 ]; then
    echo "" | tee -a "$LOG_FILE"
    echo "📦 创建版本快照..." | tee -a "$LOG_FILE"
    cp -r "$BACKUP_DIR/current" "$BACKUP_DIR/snapshot_$DATE"
    
    # 保留最近10个快照，删除旧的
    echo "🧹 清理旧快照..." | tee -a "$LOG_FILE"
    ls -1td "$BACKUP_DIR"/snapshot_* 2>/dev/null | tail -n +11 | xargs rm -rf 2>/dev/null
    
    # 记录备份信息
    echo "" | tee -a "$LOG_FILE"
    echo "✅ 备份完成!" | tee -a "$LOG_FILE"
    echo "备份时间: $(date)" | tee -a "$LOG_FILE"
    echo "快照版本: snapshot_$DATE" | tee -a "$LOG_FILE"
    echo "备份位置: $BACKUP_DIR" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "📁 备份大小:" | tee -a "$LOG_FILE"
    du -sh "$BACKUP_DIR/current" | tee -a "$LOG_FILE"
else
    echo "" | tee -a "$LOG_FILE"
    echo "❌ 备份失败! (错误码: $RSYNC_EXIT)" | tee -a "$LOG_FILE"
    exit 1
fi

echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# 显示磁盘使用情况
echo "💾 移动硬盘使用情况:" | tee -a "$LOG_FILE"
df -h /Volumes/LaCie | tee -a "$LOG_FILE"
