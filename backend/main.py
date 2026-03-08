# PartyOnce Backend - Phase 1-4 Complete Version
# FastAPI + MySQL with Supplier System, Media, Templates, Events, Sharing & Wallet

from decimal import Decimal
from fastapi import FastAPI, HTTPException, Depends, Query, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Text, DateTime, JSON, DECIMAL, ForeignKey, Enum as SQLEnum, Index, inspect as sa_inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import os
from dotenv import load_dotenv
import openai
import json
import asyncio
from enum import Enum as PyEnum
import uuid
import hashlib
import hmac
import secrets

load_dotenv()

# ==================== ENUMS ====================

class QuoteStatus(PyEnum):
    DRAFT = "draft"
    SENT = "sent"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"

class QuoteItemType(PyEnum):
    VENUE = "venue"
    MATERIAL = "material"
    LABOR = "labor"
    SERVICE = "service"
    DISCOUNT = "discount"
    TAX = "tax"

class CustomerType(PyEnum):
    PERSONAL = "personal"
    CORPORATE = "corporate"
    VIP = "vip"

class PartnerStatus(PyEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"

class MediaCategory(PyEnum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"

class UploadStatus(PyEnum):
    PENDING = "pending"
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"

class EventStatus(PyEnum):
    PLANNING = "planning"
    QUOTED = "quoted"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ShareEventType(PyEnum):
    VIEW = "view"
    CLICK = "click"
    SIGNUP = "signup"
    DEPOSIT = "deposit"
    ORDER = "order"

class TransactionType(PyEnum):
    REWARD = "reward"
    WITHDRAWAL = "withdrawal"
    REFUND = "refund"
    ADJUSTMENT = "adjustment"
    TRANSFER = "transfer"

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost/partyonce")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Storage Configuration (Cloudflare R2 or AWS S3)
STORAGE_PROVIDER = os.getenv("STORAGE_PROVIDER", "r2")  # r2 or s3
STORAGE_ENDPOINT = os.getenv("STORAGE_ENDPOINT", "")
STORAGE_ACCESS_KEY = os.getenv("STORAGE_ACCESS_KEY", "")
STORAGE_SECRET_KEY = os.getenv("STORAGE_SECRET_KEY", "")
STORAGE_BUCKET = os.getenv("STORAGE_BUCKET", "partyonce-media")
STORAGE_REGION = os.getenv("STORAGE_REGION", "auto")
STORAGE_PUBLIC_URL = os.getenv("STORAGE_PUBLIC_URL", "")

# Create Engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Print database connection info (sanitized) on startup
import re
def sanitize_db_url(url):
    """Remove password from database URL for logging"""
    if not url:
        return "Not set"
    # Replace password with ***
    sanitized = re.sub(r'://[^:]+:[^@]+@', '://***:***@', url)
    return sanitized

print("=" * 60)
print("PartyOnce API Starting...")
print(f"Database URL: {sanitize_db_url(DATABASE_URL)}")
print(f"Database target: host={engine.url.host}, port={engine.url.port}, name={engine.url.database}")
print(
    "DB env aliases: "
    f"DB_HOST={os.getenv('DB_HOST')}, DB_PORT={os.getenv('DB_PORT')}, DB_NAME={os.getenv('DB_NAME')}, "
    f"MYSQL_HOST={os.getenv('MYSQL_HOST')}, MYSQL_PORT={os.getenv('MYSQL_PORT')}, MYSQL_DATABASE={os.getenv('MYSQL_DATABASE')}"
)
print("=" * 60)

# OpenAI Client
openai_api_key = os.getenv("OPENAI_API_KEY")
openai_client = openai.OpenAI(api_key=openai_api_key) if openai_api_key else None

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login", auto_error=False)

# Optional OAuth2 scheme for endpoints that don't require authentication
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/users/login", auto_error=False)

# FastAPI App
app = FastAPI(
    title="PartyOnce API",
    version="2.0.0",
    description="PartyOnce Phase 1-4: Supplier System, Media, Templates, Events, Sharing & Wallet"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==================== DATABASE MODELS ====================

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    user_type = Column(String(50), default="personal")
    role = Column(String(50), default="user")
    phone = Column(String(50))
    company_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class Venue(Base):
    __tablename__ = "venues"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100))
    postcode = Column(String(20))
    country = Column(String(100), default="Australia")
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    capacity = Column(Integer)
    venue_type = Column(String(100))
    price_range = Column(String(50))
    regular_price = Column(DECIMAL(10, 2))
    images = Column(JSON)
    amenities = Column(JSON)
    contact_email = Column(String(255))
    contact_phone = Column(String(50))
    website = Column(String(500))
    is_active = Column(Boolean, default=True)
    is_partner = Column(Boolean, default=False)
    discount_rate = Column(DECIMAL(5, 4), default=0.0)
    partner_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# ==================== QUOTE MODELS ====================

class Quote(Base):
    __tablename__ = "quotes"
    
    id = Column(Integer, primary_key=True, index=True)
    quote_number = Column(String(50), unique=True, nullable=False, index=True)
    
    # Customer Information
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(50))
    customer_type = Column(String(50), default="personal")
    company_name = Column(String(255))
    
    # Event Information
    event_name = Column(String(255))
    event_type = Column(String(100))
    event_date = Column(DateTime)
    event_duration_hours = Column(Integer, default=4)
    guest_count = Column(Integer, default=0)
    event_notes = Column(Text)
    
    # Selected Venue
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=True)
    venue_name = Column(String(255))
    
    # Pricing Summary
    subtotal = Column(DECIMAL(12, 2), default=0.00)
    venue_discount_amount = Column(DECIMAL(12, 2), default=0.00)
    vip_discount_amount = Column(DECIMAL(12, 2), default=0.00)
    other_discount_amount = Column(DECIMAL(12, 2), default=0.00)
    discount_total = Column(DECIMAL(12, 2), default=0.00)
    tax_rate = Column(DECIMAL(5, 4), default=0.10)
    tax_amount = Column(DECIMAL(12, 2), default=0.00)
    total_amount = Column(DECIMAL(12, 2), default=0.00)
    
    # Quote Status
    status = Column(String(50), default="draft")
    valid_until = Column(DateTime)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")
    venue = relationship("Venue")
    creator = relationship("User")

class QuoteItem(Base):
    __tablename__ = "quote_items"
    
    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False)
    
    item_type = Column(String(50), nullable=False)
    item_name = Column(String(255), nullable=False)
    item_description = Column(Text)
    
    unit_price = Column(DECIMAL(12, 2), default=0.00)
    quantity = Column(Integer, default=1)
    unit = Column(String(50), default="item")
    
    discount_rate = Column(DECIMAL(5, 4), default=0.0)
    discount_amount = Column(DECIMAL(12, 2), default=0.00)
    
    original_amount = Column(DECIMAL(12, 2), default=0.00)
    final_amount = Column(DECIMAL(12, 2), default=0.00)
    
    reference_id = Column(Integer)
    reference_type = Column(String(50))
    
    sort_order = Column(Integer, default=0)
    notes = Column(Text)
    
    quote = relationship("Quote", back_populates="items")

class AIPlan(Base):
    __tablename__ = "ai_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    event_type = Column(String(100), nullable=False)
    event_name = Column(String(255))
    guest_count = Column(Integer)
    budget_range = Column(String(50))
    preferred_date = Column(DateTime)
    location_preference = Column(String(500))
    special_requests = Column(Text)
    style_preferences = Column(JSON)
    
    plan_data = Column(JSON, nullable=False)
    
    status = Column(String(50), default="active")
    selected_plan_index = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ==================== PHASE 1-4 NEW MODELS ====================

# 1. Partners Model
class Partner(Base):
    __tablename__ = "partners"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    company_name = Column(String(255), nullable=False)
    company_legal_name = Column(String(255))
    business_registration_number = Column(String(100))
    tax_id = Column(String(100))
    
    contact_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=False)
    
    business_type = Column(String(100))
    service_categories = Column(JSON)
    service_areas = Column(JSON)
    
    business_license_url = Column(String(500))
    id_document_url = Column(String(500))
    portfolio_urls = Column(JSON)
    
    status = Column(String(50), default="pending")
    rejection_reason = Column(Text)
    
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    reviewed_at = Column(DateTime)
    
    commission_rate = Column(DECIMAL(5, 4), default=0.10)
    settlement_cycle = Column(String(50), default="monthly")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])

# 2. Partner Contracts Model
class PartnerContract(Base):
    __tablename__ = "partner_contracts"
    
    id = Column(Integer, primary_key=True, index=True)
    contract_code = Column(String(100), unique=True, nullable=False)
    version = Column(String(20), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    content = Column(Text, nullable=False)
    content_url = Column(String(500))
    contract_type = Column(String(50), default="general")
    effective_date = Column(DateTime, nullable=False)
    expiry_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    is_mandatory = Column(Boolean, default=True)
    variables_schema = Column(JSON)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 3. Partner Contract Acceptances Model
class PartnerContractAcceptance(Base):
    __tablename__ = "partner_contract_acceptances"
    
    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False)
    contract_id = Column(Integer, ForeignKey("partner_contracts.id"), nullable=False)
    contract_version = Column(String(20), nullable=False)
    contract_content_snapshot = Column(Text, nullable=False)
    variables_values = Column(JSON)
    accepted_at = Column(DateTime, default=datetime.utcnow)
    accepted_ip = Column(String(45))
    accepted_user_agent = Column(Text)
    signature_image_url = Column(String(500))
    digital_signature_hash = Column(String(255))
    status = Column(String(50), default="active")
    revoked_at = Column(DateTime)
    revocation_reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# 4. Media Assets Model
class MediaAsset(Base):
    __tablename__ = "media_assets"
    
    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    original_name = Column(String(255))
    file_path = Column(String(500), nullable=False)
    public_url = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_category = Column(String(50))
    file_size_bytes = Column(Integer, nullable=False)
    file_size_human = Column(String(50))
    width_px = Column(Integer)
    height_px = Column(Integer)
    duration_seconds = Column(DECIMAL(8, 2))
    thumbnail_url = Column(String(500))
    thumbnail_width = Column(Integer)
    thumbnail_height = Column(Integer)
    upload_status = Column(String(50), default="pending")
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    uploaded_ip = Column(String(45))
    storage_provider = Column(String(50), default="r2")
    storage_bucket = Column(String(100))
    storage_region = Column(String(50))
    storage_etag = Column(String(255))
    is_compliant = Column(Boolean, default=True)
    compliance_notes = Column(Text)
    meta_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 5. Entity Media Links Model
class EntityMediaLink(Base):
    __tablename__ = "entity_media_links"
    
    id = Column(Integer, primary_key=True, index=True)
    media_id = Column(Integer, ForeignKey("media_assets.id"), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    link_type = Column(String(50), default="primary")
    sort_order = Column(Integer, default=0)
    context = Column(String(100))
    linked_by = Column(Integer, ForeignKey("users.id"))
    linked_at = Column(DateTime, default=datetime.utcnow)

# 6. Templates Model
class Template(Base):
    __tablename__ = "templates"
    
    id = Column(Integer, primary_key=True, index=True)
    template_code = Column(String(100), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)
    subcategory = Column(String(100))
    style_tags = Column(JSON)
    suitable_for = Column(JSON)
    guest_count_min = Column(Integer)
    guest_count_max = Column(Integer)
    budget_range_min = Column(DECIMAL(12, 2))
    budget_range_max = Column(DECIMAL(12, 2))
    base_price = Column(DECIMAL(12, 2), default=0.00)
    market_price = Column(DECIMAL(12, 2))
    cover_image_id = Column(Integer, ForeignKey("media_assets.id"))
    gallery_media_ids = Column(JSON)
    preview_video_id = Column(Integer, ForeignKey("media_assets.id"))
    scene_config = Column(JSON)
    status = Column(String(50), default="draft")
    is_recommended = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    order_count = Column(Integer, default=0)
    rating_average = Column(DECIMAL(3, 2), default=0.00)
    rating_count = Column(Integer, default=0)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_by_type = Column(String(50), default="admin")
    partner_id = Column(Integer, ForeignKey("partners.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime)

# 7. Template BOM Model
class TemplateBOM(Base):
    __tablename__ = "template_bom"
    
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False)
    item_name = Column(String(255), nullable=False)
    item_category = Column(String(100))
    item_description = Column(Text)
    quantity = Column(DECIMAL(10, 2), default=1.00)
    unit = Column(String(50))
    cost_price = Column(DECIMAL(12, 2))
    list_price = Column(DECIMAL(12, 2))
    supplier_partner_id = Column(Integer, ForeignKey("partners.id"))
    supplier_item_code = Column(String(100))
    is_required = Column(Boolean, default=True)
    alternatives = Column(JSON)
    model_3d_url = Column(String(500))
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 8. Events Model
class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_name = Column(String(255))
    event_type = Column(String(100))
    event_date = Column(DateTime)
    event_duration_hours = Column(Integer, default=4)
    guest_count = Column(Integer, default=0)
    event_notes = Column(Text)
    venue_id = Column(Integer, ForeignKey("venues.id"))
    venue_partner_id = Column(Integer, ForeignKey("partners.id"))
    template_id = Column(Integer, ForeignKey("templates.id"))
    customizations = Column(JSON)
    order_id = Column(Integer, ForeignKey("quotes.id"))
    status = Column(String(50), default="planning")
    setup_time = Column(DateTime)
    event_start_time = Column(DateTime)
    event_end_time = Column(DateTime)
    teardown_time = Column(DateTime)
    address = Column(String(500))
    city = Column(String(100))
    state = Column(String(100))
    postcode = Column(String(20))
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    estimated_budget = Column(DECIMAL(12, 2))
    final_price = Column(DECIMAL(12, 2))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 9. Event Albums Model
class EventAlbum(Base):
    __tablename__ = "event_albums"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    media_id = Column(Integer, ForeignKey("media_assets.id"), nullable=False)
    album_type = Column(String(50), default="general")
    caption = Column(Text)
    taken_at = Column(DateTime)
    taken_by = Column(String(255))
    sort_order = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    like_count = Column(Integer, default=0)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow)

# 10. Shares Model
class Share(Base):
    __tablename__ = "shares"
    
    id = Column(Integer, primary_key=True, index=True)
    share_code = Column(String(32), unique=True, nullable=False)
    share_type = Column(String(50), nullable=False)
    target_id = Column(Integer, nullable=False)
    target_data = Column(JSON)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_by_type = Column(String(50), default="user")
    title = Column(String(255))
    description = Column(Text)
    cover_image_url = Column(String(500))
    expires_at = Column(DateTime)
    max_uses = Column(Integer)
    use_count = Column(Integer, default=0)
    password_hash = Column(String(255))
    is_active = Column(Boolean, default=True)
    disabled_at = Column(DateTime)
    disable_reason = Column(Text)
    view_count = Column(Integer, default=0)
    click_count = Column(Integer, default=0)
    reward_enabled = Column(Boolean, default=True)
    reward_rule_id = Column(Integer, ForeignKey("reward_rules.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 10.5 User Referrals Model (for signup attribution)
class UserReferral(Base):
    __tablename__ = "user_referrals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    share_id = Column(Integer, ForeignKey("shares.id"), nullable=False)
    referrer_user_id = Column(Integer, ForeignKey("users.id"))
    referred_at = Column(DateTime, default=datetime.utcnow)

# 11. Share Events Model
class ShareEvent(Base):
    __tablename__ = "share_events"
    
    id = Column(Integer, primary_key=True, index=True)
    share_id = Column(Integer, ForeignKey("shares.id"), nullable=False)
    share_code = Column(String(32), nullable=False)
    event_type = Column(String(50), nullable=False)
    visitor_ip = Column(String(45), nullable=False)
    visitor_user_agent = Column(Text)
    visitor_fingerprint = Column(String(255))
    device_type = Column(String(50))
    browser = Column(String(100))
    os = Column(String(100))
    country = Column(String(100))
    region = Column(String(100))
    city = Column(String(100))
    referrer_url = Column(Text)
    utm_source = Column(String(100))
    utm_medium = Column(String(100))
    utm_campaign = Column(String(100))
    user_id = Column(Integer, ForeignKey("users.id"))
    event_value = Column(DECIMAL(12, 2))
    reward_amount = Column(DECIMAL(12, 2))
    reward_status = Column(String(50), default="pending")
    confirmed_at = Column(DateTime)
    event_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

# 12. Wallets Model
class Wallet(Base):
    __tablename__ = "wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, nullable=False)
    owner_type = Column(String(50), default="user")
    available_balance = Column(DECIMAL(12, 2), default=0.00)
    frozen_balance = Column(DECIMAL(12, 2), default=0.00)
    total_earned = Column(DECIMAL(12, 2), default=0.00)
    total_withdrawn = Column(DECIMAL(12, 2), default=0.00)
    currency = Column(String(10), default="USD")
    status = Column(String(50), default="active")
    withdrawal_method = Column(String(50))
    withdrawal_account = Column(JSON)
    last_activity_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 13. Wallet Ledger Model
class WalletLedger(Base):
    __tablename__ = "wallet_ledger"
    
    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    transaction_type = Column(String(50), nullable=False)
    direction = Column(String(10), nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    currency = Column(String(10), default="USD")
    balance_before = Column(DECIMAL(12, 2), nullable=False)
    balance_after = Column(DECIMAL(12, 2), nullable=False)
    source_type = Column(String(50))
    source_id = Column(Integer)
    description = Column(Text)
    reference_number = Column(String(100))
    status = Column(String(50), default="completed")
    processed_at = Column(DateTime)
    processed_by = Column(Integer, ForeignKey("users.id"))
    extra_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

# 14. Reward Rules Model
class RewardRule(Base):
    __tablename__ = "reward_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    event_type = Column(String(50), nullable=False)
    calculation_type = Column(String(50), default="fixed")
    fixed_amount = Column(DECIMAL(12, 2))
    percentage_rate = Column(DECIMAL(5, 4))
    percentage_base = Column(String(50))
    tier_config = Column(JSON)
    max_reward_per_event = Column(DECIMAL(12, 2))
    daily_cap = Column(Integer)
    monthly_cap = Column(Integer)
    applicable_to = Column(String(50), default="all")
    applicable_user_types = Column(JSON)
    effective_from = Column(DateTime, nullable=False)
    effective_until = Column(DateTime)
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=0)
    total_events_triggered = Column(Integer, default=0)
    total_reward_amount = Column(DECIMAL(12, 2), default=0.00)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ==================== 3D DESIGN MODELS ====================

class Design(Base):
    __tablename__ = "designs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    venue_type = Column(String(50), default="indoor_hall")
    venue_width = Column(DECIMAL(8, 2), default=20.0)
    venue_depth = Column(DECIMAL(8, 2), default=15.0)
    venue_height = Column(DECIMAL(8, 2), default=6.0)
    
    theme_color = Column(String(10), default="#ff6b6b")
    objects = Column(JSON)
    budget = Column(DECIMAL(12, 2), default=0.00)
    
    is_public = Column(Boolean, default=False)
    thumbnail_url = Column(String(500))
    status = Column(String(50), default="active")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User")

# ==================== PYDANTIC SCHEMAS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    user_type: str = "personal"
    role: str = "user"
    phone: Optional[str] = None
    company_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    user_type: str
    role: str
    phone: Optional[str]
    company_name: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class VenueResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    address: str
    city: str
    capacity: Optional[int]
    venue_type: Optional[str]
    price_range: Optional[str]
    regular_price: Optional[float]
    images: Optional[list]
    amenities: Optional[list]
    is_partner: bool
    discount_rate: Optional[float]
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# ==================== QUOTE SCHEMAS ====================

class QuoteItemBase(BaseModel):
    item_type: str
    item_name: str
    item_description: Optional[str] = None
    unit_price: float
    quantity: int = 1
    unit: str = "item"
    discount_rate: float = 0.0
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None
    notes: Optional[str] = None
    sort_order: int = 0

class QuoteItemCreate(QuoteItemBase):
    pass

class QuoteItemResponse(QuoteItemBase):
    id: int
    quote_id: int
    discount_amount: float
    original_amount: float
    final_amount: float
    
    class Config:
        from_attributes = True

class QuoteItemCalculate(BaseModel):
    item_type: str
    item_name: str
    item_description: Optional[str] = None
    unit_price: float
    quantity: int = 1
    unit: str = "item"
    discount_rate: float = 0.0

class CustomerInfo(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    customer_type: str = "personal"
    company_name: Optional[str] = None

class EventInfo(BaseModel):
    name: Optional[str] = None
    event_type: str
    event_date: datetime
    duration_hours: int = 4
    guest_count: int = 0
    notes: Optional[str] = None

class QuoteCalculateRequest(BaseModel):
    customer: CustomerInfo
    event: EventInfo
    venue_id: Optional[int] = None
    items: List[QuoteItemCalculate]
    additional_discount_rate: float = 0.0
    tax_rate: float = 0.10

class QuoteCreateRequest(BaseModel):
    customer: CustomerInfo
    event: EventInfo
    venue_id: Optional[int] = None
    items: List[QuoteItemCreate]
    additional_discount_rate: float = 0.0
    tax_rate: float = 0.10
    valid_days: int = 30
    notes: Optional[str] = None

class QuoteUpdateRequest(BaseModel):
    customer: Optional[CustomerInfo] = None
    event: Optional[EventInfo] = None
    venue_id: Optional[int] = None
    items: Optional[List[QuoteItemCreate]] = None
    additional_discount_rate: Optional[float] = None
    tax_rate: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class DiscountDetail(BaseModel):
    type: str
    name: str
    rate: float
    amount: float

class QuoteCalculationResult(BaseModel):
    customer: CustomerInfo
    event: EventInfo
    venue_id: Optional[int]
    venue_name: Optional[str]
    venue_partner_discount: float = 0.0
    items: List[QuoteItemResponse]
    subtotal: float
    venue_discount_amount: float
    vip_discount_amount: float
    other_discount_amount: float
    discount_total: float
    discounts: List[DiscountDetail]
    tax_rate: float
    tax_amount: float
    total_amount: float
    valid_until: datetime

class QuoteResponse(BaseModel):
    id: int
    quote_number: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str]
    customer_type: str
    company_name: Optional[str]
    event_name: Optional[str]
    event_type: str
    event_date: datetime
    event_duration_hours: int
    guest_count: int
    event_notes: Optional[str]
    venue_id: Optional[int]
    venue_name: Optional[str]
    subtotal: float
    venue_discount_amount: float
    vip_discount_amount: float
    other_discount_amount: float
    discount_total: float
    tax_rate: float
    tax_amount: float
    total_amount: float
    status: str
    valid_until: datetime
    created_at: datetime
    updated_at: datetime
    items: List[QuoteItemResponse]
    
    class Config:
        from_attributes = True

class QuoteListItem(BaseModel):
    id: int
    quote_number: str
    customer_name: str
    customer_email: str
    customer_type: str
    event_type: str
    event_date: datetime
    total_amount: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ==================== AI 策划系统 Schemas ====================

class EventType(str, PyEnum):
    BIRTHDAY = "birthday"
    WEDDING = "wedding"
    CORPORATE = "corporate"
    BABY_SHOWER = "baby_shower"
    ANNIVERSARY = "anniversary"
    GRADUATION = "graduation"
    HOLIDAY = "holiday"
    OTHER = "other"

class BudgetRange(str, PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    LUXURY = "luxury"

class AIPlanCreate(BaseModel):
    event_type: EventType
    event_name: Optional[str] = None
    guest_count: Optional[int] = Field(None, ge=1, le=1000)
    budget_range: BudgetRange = BudgetRange.MEDIUM
    preferred_date: Optional[datetime] = None
    location_preference: Optional[str] = None
    special_requests: Optional[str] = None
    style_preferences: Optional[List[str]] = []

class ActivityItem(BaseModel):
    time: str
    activity: str
    description: Optional[str] = None
    duration_minutes: Optional[int] = None

class MaterialItem(BaseModel):
    item: str
    quantity: str
    estimated_cost: Optional[str] = None
    priority: str = "medium"
    category: str

class ThemeSuggestion(BaseModel):
    theme_name: str
    theme_description: str
    color_scheme: List[str]
    key_elements: List[str]

class VenueSetup(BaseModel):
    layout_description: str
    decoration_tips: List[str]
    lighting_suggestions: List[str]
    special_areas: List[str]

class BudgetEstimate(BaseModel):
    total_estimate: str
    category_breakdown: Dict[str, str]
    cost_saving_tips: List[str]
    vendor_recommendations: Optional[List[str]] = None

class PlanOption(BaseModel):
    style_name: str
    style_description: str
    theme: ThemeSuggestion
    venue_setup: VenueSetup
    activities: List[ActivityItem]
    materials: List[MaterialItem]
    budget: BudgetEstimate
    pros: List[str]
    cons: List[str]
    best_for: str

class AIPlanResponse(BaseModel):
    id: int
    user_id: int
    event_type: str
    event_name: Optional[str]
    guest_count: Optional[int]
    budget_range: str
    status: str
    plans: List[PlanOption]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AIPlanListResponse(BaseModel):
    id: int
    event_type: str
    event_name: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ==================== 3D DESIGN SCHEMAS ====================

class DesignObject(BaseModel):
    type: str
    category: str
    position: Dict[str, float]
    rotation: Dict[str, float] = Field(default_factory=lambda: {"x": 0, "y": 0, "z": 0})

class VenueConfig(BaseModel):
    type: str
    width: float = 20.0
    depth: float = 15.0
    height: float = 6.0

class DesignCreate(BaseModel):
    name: str
    description: Optional[str] = None
    venue: VenueConfig
    theme_color: str = "#ff6b6b"
    objects: List[DesignObject]
    budget: float = 0.0
    is_public: bool = False

class DesignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[VenueConfig] = None
    theme_color: Optional[str] = None
    objects: Optional[List[DesignObject]] = None
    budget: Optional[float] = None
    is_public: Optional[bool] = None
    status: Optional[str] = None

class DesignResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    venue: VenueConfig
    theme_color: str
    objects: List[DesignObject]
    budget: float
    is_public: bool
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DesignListItem(BaseModel):
    id: int
    name: str
    venue_type: str
    budget: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ==================== PHASE 1-4 NEW SCHEMAS ====================

# Partner Schemas
class PartnerApplyRequest(BaseModel):
    company_name: str
    company_legal_name: Optional[str] = None
    business_registration_number: Optional[str] = None
    tax_id: Optional[str] = None
    contact_name: str
    contact_email: Optional[EmailStr] = None
    contact_phone: str
    business_type: Optional[str] = "other"
    service_categories: List[str] = []
    service_areas: List[str] = []

class PartnerResponse(BaseModel):
    id: int
    user_id: int
    company_name: str
    company_legal_name: Optional[str]
    business_registration_number: Optional[str]
    contact_name: str
    contact_email: str
    contact_phone: str
    business_type: str
    service_categories: Optional[List[str]]
    service_areas: Optional[List[str]]
    status: str
    rejection_reason: Optional[str]
    commission_rate: float
    settlement_cycle: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PartnerReviewRequest(BaseModel):
    status: str  # approved, rejected
    rejection_reason: Optional[str] = None
    commission_rate: Optional[float] = 0.10

# Contract Schemas
class ContractResponse(BaseModel):
    id: int
    contract_code: str
    version: str
    title: str
    description: Optional[str]
    contract_type: str
    effective_date: datetime
    expiry_date: Optional[datetime]
    is_active: bool
    is_mandatory: bool
    variables_schema: Optional[Dict]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ContractAcceptRequest(BaseModel):
    contract_id: int
    signature_image_url: Optional[str] = None

class ContractAcceptanceResponse(BaseModel):
    id: int
    partner_id: int
    contract_id: int
    contract_version: str
    accepted_at: datetime
    status: str
    
    class Config:
        from_attributes = True

# Media Schemas
class PresignUrlRequest(BaseModel):
    file_name: str
    mime_type: str
    file_size: int

class PresignUrlResponse(BaseModel):
    media_id: int
    presign_url: str
    public_url: str
    expires_in: int
    fields: Optional[Dict[str, str]] = None

class MediaConfirmRequest(BaseModel):
    media_id: int
    storage_etag: str

class MediaLinkRequest(BaseModel):
    media_id: int
    entity_type: str
    entity_id: int
    link_type: str = "primary"
    context: Optional[str] = None

class MediaResponse(BaseModel):
    id: int
    file_name: str
    original_name: Optional[str]
    public_url: str
    mime_type: str
    file_category: Optional[str]
    file_size_bytes: int
    file_size_human: Optional[str]
    width_px: Optional[int]
    height_px: Optional[int]
    duration_seconds: Optional[float]
    thumbnail_url: Optional[str]
    upload_status: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

# Template Schemas
class TemplateListResponse(BaseModel):
    id: int
    template_code: str
    name: str
    description: Optional[str]
    category: str
    subcategory: Optional[str]
    style_tags: Optional[List[str]]
    base_price: float
    cover_image_url: Optional[str]
    is_recommended: bool
    is_featured: bool
    rating_average: float
    rating_count: int
    
    class Config:
        from_attributes = True

class TemplateDetailResponse(BaseModel):
    id: int
    template_code: str
    name: str
    description: Optional[str]
    category: str
    subcategory: Optional[str]
    style_tags: Optional[List[str]]
    suitable_for: Optional[List[str]]
    guest_count_min: Optional[int]
    guest_count_max: Optional[int]
    budget_range_min: Optional[float]
    budget_range_max: Optional[float]
    base_price: float
    market_price: Optional[float]
    cover_image_url: Optional[str]
    gallery_urls: Optional[List[str]]
    scene_config: Optional[Dict]
    is_recommended: bool
    view_count: int
    order_count: int
    rating_average: float
    
    class Config:
        from_attributes = True

class TemplateBindRequest(BaseModel):
    template_id: int
    customizations: Optional[Dict] = None

# Event Schemas
class MyEventListResponse(BaseModel):
    id: int
    event_name: Optional[str]
    event_type: str
    event_date: Optional[datetime]
    guest_count: int
    status: str
    venue_name: Optional[str]
    template_name: Optional[str]
    final_price: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True

class MyEventDetailResponse(BaseModel):
    id: int
    event_name: Optional[str]
    event_type: str
    event_date: Optional[datetime]
    event_duration_hours: int
    guest_count: int
    event_notes: Optional[str]
    venue_id: Optional[int]
    venue_name: Optional[str]
    template_id: Optional[int]
    template_name: Optional[str]
    customizations: Optional[Dict]
    status: str
    estimated_budget: Optional[float]
    final_price: Optional[float]
    address: Optional[str]
    city: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class EventCreateRequest(BaseModel):
    """Request model for creating a new event"""
    event_name: Optional[str] = None
    event_type: str = "other"
    event_date: Optional[datetime] = None
    guest_count: Optional[int] = 0
    city: Optional[str] = None
    budget_range: Optional[str] = None
    style_preferences: Optional[List[str]] = None
    status: Optional[str] = "draft"

class AlbumUploadRequest(BaseModel):
    media_ids: List[int]
    album_type: str = "general"
    caption: Optional[str] = None

class AlbumPhotoResponse(BaseModel):
    id: int
    media_id: int
    public_url: str
    album_type: str
    caption: Optional[str]
    is_featured: bool
    like_count: int
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

# Share Schemas
class ShareCreateRequest(BaseModel):
    share_type: str
    target_id: int
    title: Optional[str] = None
    description: Optional[str] = None
    expires_days: Optional[int] = 30
    max_uses: Optional[int] = None
    password: Optional[str] = None
    reward_enabled: bool = True

class ShareResponse(BaseModel):
    id: int
    share_code: str
    share_type: str
    target_id: int
    title: Optional[str]
    description: Optional[str]
    cover_image_url: Optional[str]
    share_url: str
    expires_at: Optional[datetime]
    is_active: bool
    view_count: int
    click_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ShareTrackRequest(BaseModel):
    event_type: str  # click, signup, deposit
    user_id: Optional[int] = None  # 用于signup/deposit
    order_id: Optional[int] = None  # 用于deposit
    event_value: Optional[float] = None  # 用于deposit金额
    visitor_ip: Optional[str] = None
    visitor_fingerprint: Optional[str] = None
    visitor_user_agent: Optional[str] = None
    device_type: Optional[str] = None
    referrer_url: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None

class ShareLandingPageResponse(BaseModel):
    share_code: str
    title: str
    description: Optional[str]
    cover_image_url: Optional[str]
    target_type: str
    target_data: Dict
    created_at: datetime

# Wallet Schemas
class WalletResponse(BaseModel):
    id: int
    available_balance: float
    frozen_balance: float
    total_earned: float
    total_withdrawn: float
    currency: str
    status: str
    
    class Config:
        from_attributes = True

class WalletLedgerResponse(BaseModel):
    id: int
    transaction_type: str
    direction: str
    amount: float
    balance_before: float
    balance_after: float
    description: Optional[str]
    reference_number: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ==================== UTILITIES ====================

def hash_password(password: str) -> str:
    # bcrypt限制密码长度72字节
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password[:72], hashed_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> Optional[User]:
    """可选的当前用户获取，无token时返回None而不是抛出异常"""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        user = db.query(User).filter(User.email == email).first()
        return user
    except JWTError:
        return None

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def generate_share_code(length: int = 8) -> str:
    """Generate a random share code"""
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # Removed confusing chars
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"

def get_or_create_wallet(db: Session, owner_id: int, owner_type: str = "user") -> Wallet:
    """Get existing wallet or create new one"""
    wallet = db.query(Wallet).filter(
        Wallet.owner_id == owner_id,
        Wallet.owner_type == owner_type
    ).first()
    
    if not wallet:
        wallet = Wallet(
            owner_id=owner_id,
            owner_type=owner_type,
            available_balance=0.00,
            frozen_balance=0.00,
            total_earned=0.00,
            total_withdrawn=0.00,
            currency="USD",
            status="active"
        )
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    
    return wallet

def add_ledger_entry(
    db: Session,
    wallet: Wallet,
    transaction_type: str,
    direction: str,
    amount: float,
    description: str,
    source_type: Optional[str] = None,
    source_id: Optional[int] = None,
    extra_data: Optional[Dict] = None
) -> WalletLedger:
    """Add a ledger entry and update wallet balance"""
    
    balance_before = float(wallet.available_balance)
    
    if direction == "credit":
        balance_after = balance_before + amount
        wallet.available_balance = balance_after
        wallet.total_earned += amount
    else:  # debit
        balance_after = balance_before - amount
        wallet.available_balance = balance_after
        wallet.total_withdrawn += amount
    
    wallet.last_activity_at = datetime.utcnow()
    
    ledger = WalletLedger(
        wallet_id=wallet.id,
        transaction_type=transaction_type,
        direction=direction,
        amount=amount,
        currency=wallet.currency,
        balance_before=balance_before,
        balance_after=balance_after,
        description=description,
        source_type=source_type,
        source_id=source_id,
        status="completed",
        extra_data=extra_data
    )
    
    db.add(ledger)
    db.commit()
    db.refresh(ledger)
    
    return ledger

def calculate_reward(db: Session, event_type: str, event_value: float = 0) -> float:
    """Calculate reward amount based on rules"""
    rule = db.query(RewardRule).filter(
        RewardRule.event_type == event_type,
        RewardRule.is_active == True,
        RewardRule.effective_from <= datetime.utcnow()
    ).order_by(RewardRule.priority.desc()).first()
    
    if not rule:
        # Default rewards
        default_rewards = {
            "click": 0.20,
            "signup": 2.00,
            "deposit": 20.00
        }
        return default_rewards.get(event_type, 0.00)
    
    if rule.calculation_type == "fixed":
        return float(rule.fixed_amount or 0)
    elif rule.calculation_type == "percentage":
        return event_value * float(rule.percentage_rate or 0)
    
    return 0.00

def process_share_event_reward(db: Session, share_event: ShareEvent):
    """Process reward for a share event"""
    if share_event.reward_status != "pending":
        return
    
    # Get share and wallet
    share = db.query(Share).filter(Share.id == share_event.share_id).first()
    if not share or not share.reward_enabled:
        return
    
    # Calculate reward
    reward_amount = calculate_reward(
        db,
        share_event.event_type,
        float(share_event.event_value or 0)
    )
    
    if reward_amount <= 0:
        return
    
    # Get or create wallet for share creator
    wallet = get_or_create_wallet(db, share.created_by, share.created_by_type)
    
    # Add reward to wallet
    ledger = add_ledger_entry(
        db,
        wallet,
        "reward",
        "credit",
        reward_amount,
        f"Reward for {share_event.event_type} from share {share.share_code}",
        "share_event",
        share_event.id,
        {"share_code": share.share_code, "event_type": share_event.event_type}
    )
    
    # Update share event
    share_event.reward_amount = reward_amount
    share_event.reward_status = "confirmed"
    share_event.confirmed_at = datetime.utcnow()
    
    # Update share click count for click events
    if share_event.event_type == "click":
        share.click_count += 1
    
    db.commit()

# ==================== 分享奖励发放函数 (新规范) ====================

def apply_share_reward(db: Session, share: Share, event_type: str, user_id: int = None, order_id: int = None) -> Decimal:
    """
    发放分享奖励，同时写ledger并同步更新钱包余额
    - click: $0.05
    - signup: $1.00
    - deposit: $20.00
    """
    # 确定奖励金额
    reward_map = {
        "click": Decimal("0.05"),
        "signup": Decimal("1.00"),
        "deposit": Decimal("20.00")
    }
    reward_amount = reward_map.get(event_type, Decimal("0"))
    
    if reward_amount <= 0:
        return Decimal("0")
    
    # 获取分享者的钱包 (shares.created_by 是分享者)
    wallet = get_or_create_wallet(db, share.created_by, share.created_by_type or "user")
    
    # 记录奖励前的余额
    balance_before = wallet.available_balance
    balance_after = balance_before + reward_amount
    
    # 1. 写 wallet_ledger
    ledger = WalletLedger(
        wallet_id=wallet.id,
        transaction_type="reward",
        direction="credit",
        amount=reward_amount,
        currency=wallet.currency,
        balance_before=balance_before,
        balance_after=balance_after,
        source_type="share_event",
        source_id=share.id,
        description=f"{event_type.capitalize()}奖励",
        reference_number=f"SHARE-{share.share_code}-{event_type.upper()}",
        status="completed"
    )
    db.add(ledger)
    
    # 2. 同步更新 wallets 余额
    wallet.available_balance = balance_after
    wallet.total_earned += reward_amount
    wallet.last_activity_at = datetime.utcnow()
    
    db.commit()
    
    return reward_amount

# ==================== AI 策划辅助函数 ====================

def build_ai_prompt(plan_data: AIPlanCreate) -> str:
    budget_map = {
        BudgetRange.LOW: "低于 $1000",
        BudgetRange.MEDIUM: "$1000 - $5000",
        BudgetRange.HIGH: "$5000 - $15000",
        BudgetRange.LUXURY: "高于 $15000"
    }
    
    styles_str = ", ".join(plan_data.style_preferences) if plan_data.style_preferences else "优雅简约"
    
    prompt = f"""你是一位专业的活动策划专家。请为以下活动设计 3 个不同风格的完整策划方案：

活动基本信息：
- 活动类型：{plan_data.event_type.value}
- 活动名称：{plan_data.event_name or '未命名活动'}
- 预计人数：{plan_data.guest_count or '未指定'} 人
- 预算范围：{budget_map.get(plan_data.budget_range, '中等')}
- 偏好风格：{styles_str}
"""
    
    if plan_data.location_preference:
        prompt += f"- 场地偏好：{plan_data.location_preference}\n"
    
    if plan_data.special_requests:
        prompt += f"- 特殊要求：{plan_data.special_requests}\n"
    
    prompt += """
请为每个方案提供以下内容（JSON 格式）：

3 个方案应该体现不同的风格，例如：
- 方案1：优雅精致风格 (Elegant & Sophisticated)
- 方案2：轻松休闲风格 (Casual & Relaxed)  
- 方案3：创意主题风格 (Creative & Themed)

每个方案必须包含：
{
  "style_name": "风格名称",
  "style_description": "风格描述",
  "theme": {
    "theme_name": "主题名称",
    "theme_description": "主题描述",
    "color_scheme": ["颜色1", "颜色2", "颜色3"],
    "key_elements": ["关键元素1", "关键元素2"]
  },
  "venue_setup": {
    "layout_description": "场地布置描述",
    "decoration_tips": ["装饰建议1", "装饰建议2"],
    "lighting_suggestions": ["灯光建议1"],
    "special_areas": ["拍照区", "签到区"]
  },
  "activities": [
    {
      "time": "14:00",
      "activity": "活动名称",
      "description": "活动描述",
      "duration_minutes": 30
    }
  ],
  "materials": [
    {
      "item": "物品名称",
      "quantity": "数量",
      "estimated_cost": "$50-100",
      "priority": "high",
      "category": "decoration"
    }
  ],
  "budget": {
    "total_estimate": "$2000-3000",
    "category_breakdown": {
      "decoration": "$500",
      "food": "$800",
      "venue": "$600",
      "other": "$400"
    },
    "cost_saving_tips": ["省钱建议1"],
    "vendor_recommendations": ["建议供应商类型1"]
  },
  "pros": ["优点1", "优点2"],
  "cons": ["缺点1"],
  "best_for": "适合什么场合"
}

请确保返回有效的 JSON 格式，包含 3 个方案在一个数组中。"""
    
    return prompt

async def generate_ai_plans(plan_data: AIPlanCreate) -> List[Dict]:
    if not openai_client:
        print("OpenAI API Key 未配置，使用默认方案")
        return get_default_plans(plan_data)
    
    prompt = build_ai_prompt(plan_data)
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system", 
                    "content": "你是一位专业的活动策划专家，擅长为各种场合设计创意活动方案。请用中文回复，确保输出格式为有效的 JSON。"
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=4000
        )
        
        content = response.choices[0].message.content
        
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        plans = json.loads(content)
        
        if not isinstance(plans, list):
            if isinstance(plans, dict) and "plans" in plans:
                plans = plans["plans"]
            else:
                plans = [plans]
        
        while len(plans) < 3:
            plans.append(plans[0].copy())
        
        return plans[:3]
        
    except json.JSONDecodeError as e:
        print(f"JSON 解析错误: {e}")
        return get_default_plans(plan_data)
    except Exception as e:
        print(f"OpenAI API 错误: {e}")
        return get_default_plans(plan_data)

def get_default_plans(plan_data: AIPlanCreate) -> List[Dict]:
    event_type_map = {
        EventType.BIRTHDAY: "生日派对",
        EventType.WEDDING: "婚礼",
        EventType.CORPORATE: "企业活动",
        EventType.BABY_SHOWER: "宝宝派对",
        EventType.ANNIVERSARY: "周年纪念",
        EventType.GRADUATION: "毕业典礼",
        EventType.HOLIDAY: "节日派对",
        EventType.OTHER: "派对活动"
    }
    
    event_name = event_type_map.get(plan_data.event_type, "派对活动")
    
    return [
        {
            "style_name": "优雅精致风格",
            "style_description": "注重细节和品质，营造高端氛围",
            "theme": {
                "theme_name": f"{event_name} - 优雅版",
                "theme_description": "以精致装饰和高品质服务为核心",
                "color_scheme": ["金色", "白色", "香槟色"],
                "key_elements": ["鲜花装饰", "烛光氛围", "精致餐具"]
            },
            "venue_setup": {
                "layout_description": "开放式布局，中心摆放主桌，周围设休息区",
                "decoration_tips": ["使用桌花和烛台", "设置照片墙", "悬挂氛围灯串"],
                "lighting_suggestions": ["暖色调灯光", "重点照明"],
                "special_areas": ["拍照区", "签到区", "礼品区"]
            },
            "activities": [
                {"time": "14:00", "activity": "签到入场", "description": "嘉宾签到，领取伴手礼", "duration_minutes": 30},
                {"time": "14:30", "activity": "开场致辞", "description": "主人致辞，欢迎嘉宾", "duration_minutes": 15},
                {"time": "14:45", "activity": "主题活动", "description": "主要活动环节", "duration_minutes": 60},
                {"time": "15:45", "activity": "茶歇交流", "description": "自由交流时间", "duration_minutes": 30},
                {"time": "16:15", "activity": "互动游戏", "description": "趣味游戏环节", "duration_minutes": 30},
                {"time": "16:45", "activity": "合影留念", "description": "集体合影", "duration_minutes": 15},
                {"time": "17:00", "activity": "活动结束", "description": "感谢嘉宾，发放纪念品", "duration_minutes": 15}
            ],
            "materials": [
                {"item": "桌花装饰", "quantity": "10组", "estimated_cost": "$200-300", "priority": "high", "category": "decoration"},
                {"item": "气球拱门", "quantity": "1套", "estimated_cost": "$100-150", "priority": "medium", "category": "decoration"},
                {"item": "LED灯串", "quantity": "20米", "estimated_cost": "$50-80", "priority": "medium", "category": "decoration"},
                {"item": "背景板", "quantity": "1个", "estimated_cost": "$150-200", "priority": "high", "category": "decoration"},
                {"item": "一次性餐具", "quantity": "50套", "estimated_cost": "$80-100", "priority": "high", "category": "equipment"},
                {"item": "音响设备租赁", "quantity": "1套", "estimated_cost": "$200-300", "priority": "high", "category": "equipment"},
                {"item": "伴手礼", "quantity": "30份", "estimated_cost": "$300-450", "priority": "medium", "category": "other"}
            ],
            "budget": {
                "total_estimate": "$1580-2580",
                "category_breakdown": {
                    "decoration": "$500-730",
                    "equipment": "$280-400",
                    "gifts": "$300-450",
                    "food_beverage": "$400-800",
                    "contingency": "$100-200"
                },
                "cost_saving_tips": ["提前预订场地可获得折扣", "DIY 部分装饰品", "选择当季鲜花"],
                "vendor_recommendations": ["本地活动策划公司", "花艺师", "餐饮服务商"]
            },
            "pros": ["氛围精致优雅", "适合拍照留念", "给嘉宾留下深刻印象"],
            "cons": ["成本较高", "需要更多准备时间"],
            "best_for": "正式场合、重要纪念日"
        },
        {
            "style_name": "轻松休闲风格",
            "style_description": "轻松愉快的氛围，让大家自在交流",
            "theme": {
                "theme_name": f"{event_name} - 轻松版",
                "theme_description": "以轻松休闲为主，注重互动体验",
                "color_scheme": ["蓝色", "绿色", "黄色"],
                "key_elements": ["舒适座椅", "自助餐饮", "游戏道具"]
            },
            "venue_setup": {
                "layout_description": "分散式布局，设置多个小区域供小组交流",
                "decoration_tips": ["使用彩旗和气球", "设置自助餐饮区", "准备舒适坐垫"],
                "lighting_suggestions": ["自然光为主", "补充柔和灯光"],
                "special_areas": ["游戏区", "餐饮区", "休息区"]
            },
            "activities": [
                {"time": "14:00", "activity": "自由入场", "description": "嘉宾自由到达，自由活动", "duration_minutes": 30},
                {"time": "14:30", "activity": "破冰游戏", "description": "轻松游戏让嘉宾互相认识", "duration_minutes": 30},
                {"time": "15:00", "activity": "主题互动", "description": "主要活动环节", "duration_minutes": 45},
                {"time": "15:45", "activity": "自由交流", "description": "自由交谈，享用茶点", "duration_minutes": 45},
                {"time": "16:30", "activity": "趣味比赛", "description": "分组竞赛游戏", "duration_minutes": 30},
                {"time": "17:00", "activity": "分享时刻", "description": "分享感受和心得", "duration_minutes": 15}
            ],
            "materials": [
                {"item": "彩色气球", "quantity": "50个", "estimated_cost": "$30-50", "priority": "medium", "category": "decoration"},
                {"item": "彩旗彩带", "quantity": "若干", "estimated_cost": "$30-50", "priority": "low", "category": "decoration"},
                {"item": "游戏道具", "quantity": "1套", "estimated_cost": "$100-150", "priority": "high", "category": "equipment"},
                {"item": "音响设备", "quantity": "1套", "estimated_cost": "$150-200", "priority": "medium", "category": "equipment"},
                {"item": "一次性餐具", "quantity": "50套", "estimated_cost": "$50-80", "priority": "high", "category": "equipment"},
                {"item": "坐垫靠枕", "quantity": "20个", "estimated_cost": "$100-150", "priority": "low", "category": "equipment"}
            ],
            "budget": {
                "total_estimate": "$960-1680",
                "category_breakdown": {
                    "decoration": "$60-100",
                    "equipment": "$300-430",
                    "games": "$100-150",
                    "food_beverage": "$400-800",
                    "contingency": "$100-200"
                },
                "cost_saving_tips": ["选择公园或家庭场地", "自制游戏道具", "准备简单食物"],
                "vendor_recommendations": ["户外活动用品店", "简单餐饮外卖"]
            },
            "pros": ["成本低", "氛围轻松", "准备简单"],
            "cons": ["不够正式", "受天气影响大（如户外）"],
            "best_for": "朋友聚会、家庭活动、团队建设"
        },
        {
            "style_name": "创意主题风格",
            "style_description": "独特的主题设计，让活动与众不同",
            "theme": {
                "theme_name": f"{event_name} - 创意版",
                "theme_description": "以独特主题为特色，创意装饰和互动",
                "color_scheme": ["紫色", "粉色", "银色"],
                "key_elements": ["主题道具", "定制装饰", "特色服装"]
            },
            "venue_setup": {
                "layout_description": "根据主题设计的沉浸式场景布局",
                "decoration_tips": ["主题背景墙", "定制道具", "特色照明效果"],
                "lighting_suggestions": ["彩色灯光", "主题氛围灯", "聚光灯"],
                "special_areas": ["主题打卡区", "互动体验区", "特色餐饮区"]
            },
            "activities": [
                {"time": "14:00", "activity": "主题换装", "description": "嘉宾根据主题换装/化妆", "duration_minutes": 30},
                {"time": "14:30", "activity": "开场秀", "description": "主题开场表演或介绍", "duration_minutes": 15},
                {"time": "14:45", "activity": "主题体验", "description": "沉浸式主题体验活动", "duration_minutes": 60},
                {"time": "15:45", "activity": "创意工作坊", "description": "动手制作主题相关物品", "duration_minutes": 30},
                {"time": "16:15", "activity": "主题游戏", "description": "与主题相关的互动游戏", "duration_minutes": 30},
                {"time": "16:45", "activity": "最佳造型评选", "description": "评选最佳主题造型", "duration_minutes": 15},
                {"time": "17:00", "activity": "主题派对", "description": "自由交流和庆祝", "duration_minutes": 30}
            ],
            "materials": [
                {"item": "主题背景板", "quantity": "1套", "estimated_cost": "$200-300", "priority": "high", "category": "decoration"},
                {"item": "主题道具", "quantity": "1批", "estimated_cost": "$150-250", "priority": "high", "category": "decoration"},
                {"item": "主题装饰品", "quantity": "若干", "estimated_cost": "$100-200", "priority": "medium", "category": "decoration"},
                {"item": "化妆道具", "quantity": "1套", "estimated_cost": "$100-150", "priority": "medium", "category": "equipment"},
                {"item": "灯光设备", "quantity": "1套", "estimated_cost": "$200-300", "priority": "medium", "category": "equipment"},
                {"item": "工作坊材料", "quantity": "30份", "estimated_cost": "$150-200", "priority": "high", "category": "equipment"},
                {"item": "主题服装配件", "quantity": "30套", "estimated_cost": "$200-300", "priority": "low", "category": "other"}
            ],
            "budget": {
                "total_estimate": "$1600-2700",
                "category_breakdown": {
                    "decoration": "$450-750",
                    "equipment": "$450-650",
                    "costumes": "$200-300",
                    "food_beverage": "$400-800",
                    "contingency": "$100-200"
                },
                "cost_saving_tips": ["DIY 主题道具", "使用可回收材料", "提前网购装饰品"],
                "vendor_recommendations": ["主题派对用品店", "手工艺品店", "灯光租赁"]
            },
            "pros": ["独特难忘", "社交媒体友好", "互动性强"],
            "cons": ["需要创意策划", "某些道具成本高"],
            "best_for": "年轻人聚会、社交媒体达人、创意活动"
        }
    ]

# ==================== QUOTE UTILITIES ====================

def generate_quote_number() -> str:
    date_str = datetime.now().strftime("%Y%m%d")
    random_suffix = uuid.uuid4().hex[:4].upper()
    return f"Q-{date_str}-{random_suffix}"

def get_vip_discount_rate(customer_type: str) -> float:
    vip_rates = {
        "personal": 0.0,
        "corporate": 0.05,
        "vip": 0.15,
    }
    return vip_rates.get(customer_type, 0.0)

def calculate_quote_item(item_data: dict) -> dict:
    unit_price = float(item_data.get("unit_price", 0))
    quantity = int(item_data.get("quantity", 1))
    discount_rate = float(item_data.get("discount_rate", 0))
    
    original_amount = unit_price * quantity
    discount_amount = original_amount * discount_rate
    final_amount = original_amount - discount_amount
    
    return {
        **item_data,
        "original_amount": round(original_amount, 2),
        "discount_amount": round(discount_amount, 2),
        "final_amount": round(final_amount, 2),
    }

def calculate_quote(
    db: Session,
    customer: CustomerInfo,
    event: EventInfo,
    venue_id: Optional[int],
    items: List[dict],
    additional_discount_rate: float = 0.0,
    tax_rate: float = 0.10
) -> QuoteCalculationResult:
    venue = None
    venue_partner_discount = 0.0
    venue_name = None
    
    if venue_id:
        venue = db.query(Venue).filter(Venue.id == venue_id).first()
        if venue:
            venue_name = venue.name
            if venue.is_partner and venue.discount_rate:
                venue_partner_discount = float(venue.discount_rate)
    
    calculated_items = []
    subtotal = 0.0
    venue_discount_amount = 0.0
    
    for idx, item_data in enumerate(items):
        item_dict = item_data if isinstance(item_data, dict) else item_data.dict()
        
        if item_dict.get("item_type") == "venue" and venue_partner_discount > 0:
            item_dict["discount_rate"] = venue_partner_discount
        
        calculated = calculate_quote_item(item_dict)
        calculated["sort_order"] = idx
        calculated_items.append(calculated)
        
        subtotal += calculated["original_amount"]
        
        if item_dict.get("item_type") == "venue":
            venue_discount_amount += calculated["discount_amount"]
    
    vip_rate = get_vip_discount_rate(customer.customer_type)
    non_venue_subtotal = sum(
        item["original_amount"] for item in calculated_items 
        if item.get("item_type") != "venue"
    )
    vip_discount_amount = non_venue_subtotal * vip_rate
    
    remaining_after_vip = subtotal - venue_discount_amount - vip_discount_amount
    other_discount_amount = remaining_after_vip * additional_discount_rate
    
    discount_total = venue_discount_amount + vip_discount_amount + other_discount_amount
    
    discounts = []
    if venue_discount_amount > 0:
        discounts.append(DiscountDetail(
            type="partner",
            name=f"合作场地折扣 ({venue_partner_discount*100:.0f}%)",
            rate=venue_partner_discount,
            amount=round(venue_discount_amount, 2)
        ))
    if vip_discount_amount > 0:
        discounts.append(DiscountDetail(
            type="vip",
            name=f"VIP客户折扣 ({vip_rate*100:.0f}%)",
            rate=vip_rate,
            amount=round(vip_discount_amount, 2)
        ))
    if other_discount_amount > 0:
        discounts.append(DiscountDetail(
            type="other",
            name=f"额外折扣 ({additional_discount_rate*100:.0f}%)",
            rate=additional_discount_rate,
            amount=round(other_discount_amount, 2)
        ))
    
    taxable_amount = subtotal - discount_total
    tax_amount = taxable_amount * tax_rate
    total_amount = taxable_amount + tax_amount
    valid_until = datetime.utcnow() + timedelta(days=30)
    
    item_responses = []
    for item in calculated_items:
        item_responses.append(QuoteItemResponse(
            id=0,
            quote_id=0,
            item_type=item["item_type"],
            item_name=item["item_name"],
            item_description=item.get("item_description"),
            unit_price=item["unit_price"],
            quantity=item["quantity"],
            unit=item.get("unit", "item"),
            discount_rate=item["discount_rate"],
            discount_amount=item["discount_amount"],
            original_amount=item["original_amount"],
            final_amount=item["final_amount"],
            reference_id=item.get("reference_id"),
            reference_type=item.get("reference_type"),
            notes=item.get("notes"),
            sort_order=item["sort_order"]
        ))
    
    return QuoteCalculationResult(
        customer=customer,
        event=event,
        venue_id=venue_id,
        venue_name=venue_name,
        venue_partner_discount=venue_partner_discount,
        items=item_responses,
        subtotal=round(subtotal, 2),
        venue_discount_amount=round(venue_discount_amount, 2),
        vip_discount_amount=round(vip_discount_amount, 2),
        other_discount_amount=round(other_discount_amount, 2),
        discount_total=round(discount_total, 2),
        discounts=discounts,
        tax_rate=tax_rate,
        tax_amount=round(tax_amount, 2),
        total_amount=round(total_amount, 2),
        valid_until=valid_until
    )

def get_quote_response(quote: Quote) -> QuoteResponse:
    items = []
    for item in quote.items:
        items.append(QuoteItemResponse(
            id=item.id,
            quote_id=item.quote_id,
            item_type=item.item_type,
            item_name=item.item_name,
            item_description=item.item_description,
            unit_price=float(item.unit_price),
            quantity=item.quantity,
            unit=item.unit,
            discount_rate=float(item.discount_rate),
            discount_amount=float(item.discount_amount),
            original_amount=float(item.original_amount),
            final_amount=float(item.final_amount),
            reference_id=item.reference_id,
            reference_type=item.reference_type,
            notes=item.notes,
            sort_order=item.sort_order
        ))
    
    return QuoteResponse(
        id=quote.id,
        quote_number=quote.quote_number,
        customer_name=quote.customer_name,
        customer_email=quote.customer_email,
        customer_phone=quote.customer_phone,
        customer_type=quote.customer_type,
        company_name=quote.company_name,
        event_name=quote.event_name,
        event_type=quote.event_type,
        event_date=quote.event_date,
        event_duration_hours=quote.event_duration_hours,
        guest_count=quote.guest_count,
        event_notes=quote.event_notes,
        venue_id=quote.venue_id,
        venue_name=quote.venue_name,
        subtotal=float(quote.subtotal),
        venue_discount_amount=float(quote.venue_discount_amount),
        vip_discount_amount=float(quote.vip_discount_amount),
        other_discount_amount=float(quote.other_discount_amount),
        discount_total=float(quote.discount_total),
        tax_rate=float(quote.tax_rate),
        tax_amount=float(quote.tax_amount),
        total_amount=float(quote.total_amount),
        status=quote.status,
        valid_until=quote.valid_until,
        created_at=quote.created_at,
        updated_at=quote.updated_at,
        items=items
    )

# ==================== API ENDPOINTS ====================

@app.get("/")
def read_root():
    return {"message": "PartyOnce API", "status": "running", "version": "2.0.0"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# User Endpoints
@app.post("/api/users/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user.password)
    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        user_type=user.user_type,
        role=user.role,
        phone=user.phone,
        company_name=user.company_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/users/login")
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "user_type": user.user_type,
            "role": user.role
        }
    }

@app.get("/api/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Venue Endpoints
@app.get("/api/venues", response_model=List[VenueResponse])
def get_venues(
    city: Optional[str] = None,
    venue_type: Optional[str] = None,
    partner_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Venue)
    
    if city:
        query = query.filter(Venue.city == city)
    if venue_type:
        query = query.filter(Venue.venue_type == venue_type)
    if partner_only:
        query = query.filter(Venue.is_partner == True)
    
    venues = query.all()
    return venues

@app.get("/api/venues/{venue_id}")
def get_venue(venue_id: int, db: Session = Depends(get_db)):
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue

# ==================== QUOTE API ENDPOINTS ====================

@app.post("/api/quotes/calculate", response_model=QuoteCalculationResult)
def calculate_quote_endpoint(
    request: QuoteCalculateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    try:
        items_data = [item.dict() for item in request.items]
        
        result = calculate_quote(
            db=db,
            customer=request.customer,
            event=request.event,
            venue_id=request.venue_id,
            items=items_data,
            additional_discount_rate=request.additional_discount_rate,
            tax_rate=request.tax_rate
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quote calculation failed: {str(e)}")

@app.post("/api/quotes", response_model=QuoteResponse)
def create_quote(
    request: QuoteCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        items_data = [item.dict() for item in request.items]
        calculation = calculate_quote(
            db=db,
            customer=request.customer,
            event=request.event,
            venue_id=request.venue_id,
            items=items_data,
            additional_discount_rate=request.additional_discount_rate,
            tax_rate=request.tax_rate
        )
        
        quote = Quote(
            quote_number=generate_quote_number(),
            customer_name=request.customer.name,
            customer_email=request.customer.email,
            customer_phone=request.customer.phone,
            customer_type=request.customer.customer_type,
            company_name=request.customer.company_name,
            event_name=request.event.name,
            event_type=request.event.event_type,
            event_date=request.event.event_date,
            event_duration_hours=request.event.duration_hours,
            guest_count=request.event.guest_count,
            event_notes=request.event.notes,
            venue_id=request.venue_id,
            venue_name=calculation.venue_name,
            subtotal=calculation.subtotal,
            venue_discount_amount=calculation.venue_discount_amount,
            vip_discount_amount=calculation.vip_discount_amount,
            other_discount_amount=calculation.other_discount_amount,
            discount_total=calculation.discount_total,
            tax_rate=request.tax_rate,
            tax_amount=calculation.tax_amount,
            total_amount=calculation.total_amount,
            status="draft",
            valid_until=datetime.utcnow() + timedelta(days=request.valid_days),
            created_by=current_user.id if current_user else None
        )
        
        db.add(quote)
        db.flush()
        
        for idx, item_data in enumerate(request.items):
            item_dict = item_data.dict()
            calculated = calculate_quote_item(item_dict)
            
            quote_item = QuoteItem(
                quote_id=quote.id,
                item_type=item_dict["item_type"],
                item_name=item_dict["item_name"],
                item_description=item_dict.get("item_description"),
                unit_price=item_dict["unit_price"],
                quantity=item_dict["quantity"],
                unit=item_dict.get("unit", "item"),
                discount_rate=calculated["discount_rate"],
                discount_amount=calculated["discount_amount"],
                original_amount=calculated["original_amount"],
                final_amount=calculated["final_amount"],
                reference_id=item_dict.get("reference_id"),
                reference_type=item_dict.get("reference_type"),
                notes=item_dict.get("notes"),
                sort_order=idx
            )
            db.add(quote_item)
        
        db.commit()
        db.refresh(quote)
        
        return get_quote_response(quote)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create quote: {str(e)}")

@app.get("/api/quotes", response_model=List[QuoteListItem])
def list_quotes(
    status: Optional[str] = None,
    customer_type: Optional[str] = None,
    event_type: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Quote)
    
    if status:
        query = query.filter(Quote.status == status)
    if customer_type:
        query = query.filter(Quote.customer_type == customer_type)
    if event_type:
        query = query.filter(Quote.event_type == event_type)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Quote.quote_number.ilike(search_filter)) |
            (Quote.customer_name.ilike(search_filter)) |
            (Quote.customer_email.ilike(search_filter)) |
            (Quote.event_name.ilike(search_filter))
        )
    
    quotes = query.order_by(Quote.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        QuoteListItem(
            id=q.id,
            quote_number=q.quote_number,
            customer_name=q.customer_name,
            customer_email=q.customer_email,
            customer_type=q.customer_type,
            event_type=q.event_type,
            event_date=q.event_date,
            total_amount=float(q.total_amount),
            status=q.status,
            created_at=q.created_at
        )
        for q in quotes
    ]

@app.get("/api/quotes/{quote_id}", response_model=QuoteResponse)
def get_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    return get_quote_response(quote)

# ==================== AI 策划 API 端点 ====================

@app.post("/api/ai/plan", response_model=AIPlanResponse)
async def create_ai_plan(
    plan_data: AIPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        generated_plans = await generate_ai_plans(plan_data)
        
        db_plan = AIPlan(
            user_id=current_user.id,
            event_type=plan_data.event_type.value,
            event_name=plan_data.event_name,
            guest_count=plan_data.guest_count,
            budget_range=plan_data.budget_range.value,
            preferred_date=plan_data.preferred_date,
            location_preference=plan_data.location_preference,
            special_requests=plan_data.special_requests,
            style_preferences=plan_data.style_preferences,
            plan_data={"plans": generated_plans},
            status="active"
        )
        
        db.add(db_plan)
        db.commit()
        db.refresh(db_plan)
        
        return AIPlanResponse(
            id=db_plan.id,
            user_id=db_plan.user_id,
            event_type=db_plan.event_type,
            event_name=db_plan.event_name,
            guest_count=db_plan.guest_count,
            budget_range=db_plan.budget_range,
            status=db_plan.status,
            plans=[PlanOption(**plan) for plan in generated_plans],
            created_at=db_plan.created_at,
            updated_at=db_plan.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"生成策划方案失败: {str(e)}")

@app.get("/api/ai/plans/{plan_id}", response_model=AIPlanResponse)
def get_ai_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(AIPlan).filter(
        AIPlan.id == plan_id,
        AIPlan.user_id == current_user.id
    ).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="策划方案未找到")
    
    plans_data = plan.plan_data.get("plans", []) if plan.plan_data else []
    
    return AIPlanResponse(
        id=plan.id,
        user_id=plan.user_id,
        event_type=plan.event_type,
        event_name=plan.event_name,
        guest_count=plan.guest_count,
        budget_range=plan.budget_range,
        status=plan.status,
        plans=[PlanOption(**p) for p in plans_data],
        created_at=plan.created_at,
        updated_at=plan.updated_at
    )

@app.get("/api/ai/plans", response_model=List[AIPlanListResponse])
def list_ai_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20
):
    plans = db.query(AIPlan).filter(
        AIPlan.user_id == current_user.id
    ).order_by(AIPlan.created_at.desc()).offset(skip).limit(limit).all()
    
    return plans

# ==================== 3D DESIGN API ENDPOINTS ====================

@app.post("/api/designs", response_model=DesignResponse)
def create_design(
    design_data: DesignCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        db_design = Design(
            user_id=current_user.id,
            name=design_data.name,
            description=design_data.description,
            venue_type=design_data.venue.type,
            venue_width=design_data.venue.width,
            venue_depth=design_data.venue.depth,
            venue_height=design_data.venue.height,
            theme_color=design_data.theme_color,
            objects=[obj.dict() for obj in design_data.objects],
            budget=design_data.budget,
            is_public=design_data.is_public,
            status="active"
        )
        
        db.add(db_design)
        db.commit()
        db.refresh(db_design)
        
        return DesignResponse(
            id=db_design.id,
            user_id=db_design.user_id,
            name=db_design.name,
            description=db_design.description,
            venue=VenueConfig(
                type=db_design.venue_type,
                width=float(db_design.venue_width),
                depth=float(db_design.venue_depth),
                height=float(db_design.venue_height)
            ),
            theme_color=db_design.theme_color,
            objects=[DesignObject(**obj) for obj in db_design.objects] if db_design.objects else [],
            budget=float(db_design.budget),
            is_public=db_design.is_public,
            status=db_design.status,
            created_at=db_design.created_at,
            updated_at=db_design.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create design: {str(e)}")

@app.get("/api/designs", response_model=List[DesignListItem])
def list_designs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    designs = db.query(Design).filter(
        Design.user_id == current_user.id,
        Design.status.in_(["active", "archived"])
    ).order_by(Design.updated_at.desc()).offset(skip).limit(limit).all()
    
    return [
        DesignListItem(
            id=d.id,
            name=d.name,
            venue_type=d.venue_type,
            budget=float(d.budget),
            status=d.status,
            created_at=d.created_at
        )
        for d in designs
    ]

@app.get("/api/designs/{design_id}", response_model=DesignResponse)
def get_design(
    design_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    design = db.query(Design).filter(
        Design.id == design_id,
        Design.user_id == current_user.id
    ).first()
    
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    return DesignResponse(
        id=design.id,
        user_id=design.user_id,
        name=design.name,
        description=design.description,
        venue=VenueConfig(
            type=design.venue_type,
            width=float(design.venue_width),
            depth=float(design.venue_depth),
            height=float(design.venue_height)
        ),
        theme_color=design.theme_color,
        objects=[DesignObject(**obj) for obj in design.objects] if design.objects else [],
        budget=float(design.budget),
        is_public=design.is_public,
        status=design.status,
        created_at=design.created_at,
        updated_at=design.updated_at
    )

# ==================== PHASE 1-4 NEW ENDPOINTS ====================
# Supplier Endpoints

@app.post("/api/partners/apply", response_model=PartnerResponse)
def apply_partner(
    request: PartnerApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply to become a partner/supplier"""
    existing = db.query(Partner).filter(Partner.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted an application")
    
    partner = Partner(
        user_id=current_user.id,
        company_name=request.company_name,
        company_legal_name=request.company_legal_name,
        business_registration_number=request.business_registration_number,
        tax_id=request.tax_id,
        contact_name=request.contact_name,
        contact_email=request.contact_email,
        contact_phone=request.contact_phone,
        business_type=request.business_type,
        service_categories=request.service_categories,
        service_areas=request.service_areas,
        status="pending"
    )
    
    db.add(partner)
    db.commit()
    db.refresh(partner)
    
    return partner

@app.get("/api/partners/me", response_model=PartnerResponse)
def get_my_partner_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's partner information"""
    partner = db.query(Partner).filter(Partner.user_id == current_user.id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner application not found")
    return partner

@app.get("/api/partner/contracts", response_model=List[ContractResponse])
def get_partner_contracts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of contracts for partner to sign"""
    # Get current partner
    partner = db.query(Partner).filter(Partner.user_id == current_user.id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    # Get all active contracts
    contracts = db.query(PartnerContract).filter(
        PartnerContract.is_active == True,
        PartnerContract.effective_date <= datetime.utcnow()
    ).all()
    
    return contracts

@app.post("/api/partner/contracts/{contract_id}/accept", response_model=ContractAcceptanceResponse)
def accept_contract(
    contract_id: int,
    request: ContractAcceptRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept/sign a contract"""
    partner = db.query(Partner).filter(Partner.user_id == current_user.id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    contract = db.query(PartnerContract).filter(PartnerContract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Check if already accepted
    existing = db.query(PartnerContractAcceptance).filter(
        PartnerContractAcceptance.partner_id == partner.id,
        PartnerContractAcceptance.contract_id == contract_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Contract already accepted")
    
    # Generate digital signature hash
    signature_data = f"{partner.id}:{contract_id}:{datetime.utcnow().isoformat()}"
    digital_hash = hashlib.sha256(signature_data.encode()).hexdigest()
    
    acceptance = PartnerContractAcceptance(
        partner_id=partner.id,
        contract_id=contract_id,
        contract_version=contract.version,
        contract_content_snapshot=contract.content,
        variables_values={
            "partner_name": partner.company_name,
            "commission_rate": float(partner.commission_rate),
            "settlement_cycle": partner.settlement_cycle,
            "sign_date": datetime.utcnow().strftime("%Y-%m-%d")
        },
        signature_image_url=request.signature_image_url,
        digital_signature_hash=digital_hash,
        status="active"
    )
    
    db.add(acceptance)
    db.commit()
    db.refresh(acceptance)
    
    return acceptance

@app.get("/api/partner/media", response_model=List[MediaResponse])
def get_partner_media(
    link_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get media assets uploaded by partner"""
    query = db.query(MediaAsset).filter(MediaAsset.uploaded_by == current_user.id)
    
    if link_type:
        # Filter by entity link type
        media_ids = db.query(EntityMediaLink.media_id).filter(
            EntityMediaLink.entity_type == "partner",
            EntityMediaLink.link_type == link_type
        ).subquery()
        query = query.filter(MediaAsset.id.in_(media_ids))
    
    media = query.order_by(MediaAsset.created_at.desc()).all()
    return media

# Admin Endpoints

@app.get("/api/admin/partners", response_model=List[PartnerResponse])
def list_partner_applications(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List partner applications for admin review"""
    query = db.query(Partner)
    
    if status:
        query = query.filter(Partner.status == status)
    
    partners = query.order_by(Partner.created_at.desc()).offset(skip).limit(limit).all()
    return partners

@app.post("/api/admin/partners/{partner_id}/approve", response_model=PartnerResponse)
def approve_partner(
    partner_id: int,
    request: PartnerReviewRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Approve a partner application"""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    if partner.status != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot approve partner with status: {partner.status}")
    
    partner.status = "approved"
    partner.reviewed_by = current_user.id
    partner.reviewed_at = datetime.utcnow()
    if request.commission_rate:
        partner.commission_rate = request.commission_rate
    
    # Update user role to partner
    user = db.query(User).filter(User.id == partner.user_id).first()
    if user:
        user.role = "partner"
    
    db.commit()
    db.refresh(partner)
    
    return partner

@app.post("/api/admin/partners/{partner_id}/reject", response_model=PartnerResponse)
def reject_partner(
    partner_id: int,
    request: PartnerReviewRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Reject a partner application"""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    if partner.status != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot reject partner with status: {partner.status}")
    
    partner.status = "rejected"
    partner.rejection_reason = request.rejection_reason
    partner.reviewed_by = current_user.id
    partner.reviewed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(partner)
    
    return partner

# Media Upload Endpoints

@app.post("/api/media/presign", response_model=PresignUrlResponse)
def get_presign_url(
    request: PresignUrlRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get presigned URL for direct upload to object storage"""
    
    # Validate file type
    allowed_types = {
        'image/jpeg': 'image',
        'image/png': 'image',
        'image/gif': 'image',
        'image/webp': 'image',
        'video/mp4': 'video',
        'video/quicktime': 'video',
        'video/webm': 'video'
    }
    
    if request.mime_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    # Check file size (max 100MB for video, 10MB for images)
    max_size = 100 * 1024 * 1024 if allowed_types[request.mime_type] == 'video' else 10 * 1024 * 1024
    if request.file_size > max_size:
        raise HTTPException(status_code=400, detail=f"File size exceeds maximum allowed ({max_size // (1024*1024)}MB)")
    
    # Generate unique file path
    file_ext = request.file_name.split('.')[-1]
    unique_name = f"{uuid.uuid4().hex}.{file_ext}"
    file_path = f"uploads/{datetime.utcnow().strftime('%Y/%m')}/{unique_name}"
    
    # Create media asset record
    media = MediaAsset(
        file_name=unique_name,
        original_name=request.file_name,
        file_path=file_path,
        public_url=f"{STORAGE_PUBLIC_URL}/{file_path}" if STORAGE_PUBLIC_URL else f"{STORAGE_ENDPOINT}/{STORAGE_BUCKET}/{file_path}",
        mime_type=request.mime_type,
        file_category=allowed_types[request.mime_type],
        file_size_bytes=request.file_size,
        file_size_human=format_file_size(request.file_size),
        upload_status="pending",
        uploaded_by=current_user.id,
        storage_provider=STORAGE_PROVIDER,
        storage_bucket=STORAGE_BUCKET,
        storage_region=STORAGE_REGION
    )
    
    db.add(media)
    db.commit()
    db.refresh(media)
    
    # Generate presigned URL (simplified - in production, use boto3 or equivalent)
    # For R2/S3, this would generate a proper presigned POST/PUT URL
    presign_url = f"{STORAGE_ENDPOINT}/{STORAGE_BUCKET}/{file_path}?X-Amz-Algorithm=AWS4-HMAC-SHA256"
    
    return PresignUrlResponse(
        media_id=media.id,
        presign_url=presign_url,
        public_url=media.public_url,
        expires_in=3600,
        fields={
            "key": file_path,
            "Content-Type": request.mime_type
        }
    )

@app.post("/api/media/confirm")
def confirm_media_upload(
    request: MediaConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Confirm media upload is complete"""
    media = db.query(MediaAsset).filter(
        MediaAsset.id == request.media_id,
        MediaAsset.uploaded_by == current_user.id
    ).first()
    
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    media.upload_status = "uploaded"
    media.storage_etag = request.storage_etag
    
    # Check video compliance
    if media.file_category == "video":
        # In production, would trigger a processing job to get actual duration
        # Here we just mark as processing
        media.upload_status = "processing"
        # For now assume compliant (would check actual duration after processing)
        media.is_compliant = True
    else:
        media.upload_status = "ready"
    
    db.commit()
    
    return {"message": "Upload confirmed", "media_id": media.id, "status": media.upload_status}

@app.post("/api/media/link")
def link_media_to_entity(
    request: MediaLinkRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Link a media asset to an entity"""
    media = db.query(MediaAsset).filter(MediaAsset.id == request.media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    if media.uploaded_by != current_user.id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to link this media")
    
    link = EntityMediaLink(
        media_id=request.media_id,
        entity_type=request.entity_type,
        entity_id=request.entity_id,
        link_type=request.link_type,
        context=request.context,
        linked_by=current_user.id
    )
    
    db.add(link)
    db.commit()
    
    return {"message": "Media linked successfully", "link_id": link.id}

# Template Endpoints

@app.get("/api/templates", response_model=List[TemplateListResponse])
def list_templates(
    category: Optional[str] = None,
    is_recommended: Optional[bool] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """List available templates"""
    query = db.query(Template).filter(Template.status == "published")
    
    if category:
        query = query.filter(Template.category == category)
    if is_recommended is not None:
        query = query.filter(Template.is_recommended == is_recommended)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Template.name.ilike(search_filter)) |
            (Template.description.ilike(search_filter))
        )
    
    templates = query.order_by(Template.is_featured.desc(), Template.order_count.desc()).offset(skip).limit(limit).all()
    
    result = []
    for t in templates:
        cover_url = None
        if t.cover_image_id:
            media = db.query(MediaAsset).filter(MediaAsset.id == t.cover_image_id).first()
            cover_url = media.public_url if media else None
        
        result.append(TemplateListResponse(
            id=t.id,
            template_code=t.template_code,
            name=t.name,
            description=t.description,
            category=t.category,
            subcategory=t.subcategory,
            style_tags=t.style_tags,
            base_price=float(t.base_price) if t.base_price is not None else 0.0,
            cover_image_url=cover_url,
            is_recommended=t.is_recommended,
            is_featured=t.is_featured,
            rating_average=float(t.rating_average) if t.rating_average is not None else 0.0,
            rating_count=t.rating_count
        ))
    
    return result

@app.get("/api/templates/{template_id}", response_model=TemplateDetailResponse)
def get_template_detail(
    template_id: int,
    db: Session = Depends(get_db)
):
    """Get template details"""
    template = db.query(Template).filter(
        Template.id == template_id,
        Template.status == "published"
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Increment view count
    template.view_count += 1
    db.commit()
    
    cover_url = None
    if template.cover_image_id:
        media = db.query(MediaAsset).filter(MediaAsset.id == template.cover_image_id).first()
        cover_url = media.public_url if media else None
    
    gallery_urls = []
    if template.gallery_media_ids:
        for media_id in template.gallery_media_ids:
            media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
            if media:
                gallery_urls.append(media.public_url)
    
    return TemplateDetailResponse(
        id=template.id,
        template_code=template.template_code,
        name=template.name,
        description=template.description,
        category=template.category,
        subcategory=template.subcategory,
        style_tags=template.style_tags,
        suitable_for=template.suitable_for,
        guest_count_min=template.guest_count_min,
        guest_count_max=template.guest_count_max,
        budget_range_min=float(template.budget_range_min) if template.budget_range_min else None,
        budget_range_max=float(template.budget_range_max) if template.budget_range_max else None,
        base_price=float(template.base_price),
        market_price=float(template.market_price) if template.market_price else None,
        cover_image_url=cover_url,
        gallery_urls=gallery_urls,
        scene_config=template.scene_config,
        is_recommended=template.is_recommended,
        view_count=template.view_count,
        order_count=template.order_count,
        rating_average=float(template.rating_average)
    )

@app.post("/api/orders/{order_id}/bind-template")
def bind_template_to_order(
    order_id: int,
    request: TemplateBindRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bind a template to an order (creates an event from template)"""
    # Get the quote/order
    quote = db.query(Quote).filter(Quote.id == order_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get the template
    template = db.query(Template).filter(Template.id == request.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Create event from quote and template
    event = Event(
        user_id=current_user.id,
        event_name=quote.event_name,
        event_type=quote.event_type,
        event_date=quote.event_date,
        event_duration_hours=quote.event_duration_hours,
        guest_count=quote.guest_count,
        event_notes=quote.event_notes,
        venue_id=quote.venue_id,
        template_id=request.template_id,
        customizations=request.customizations,
        order_id=order_id,
        status="confirmed",
        final_price=float(quote.total_amount)
    )
    
    db.add(event)
    
    # Increment template order count
    template.order_count += 1
    
    db.commit()
    db.refresh(event)
    
    return {"message": "Template bound to order successfully", "event_id": event.id}

# My Events Endpoints

@app.post("/api/events", response_model=MyEventDetailResponse)
def create_event(
    request: EventCreateRequest,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Create a new event (draft)"""
    # Create event with provided data
    event_data = {
        "event_name": request.event_name or f"{request.city or 'New'}派对方案",
        "event_type": request.event_type or "other",
        "event_date": request.event_date or (datetime.utcnow() + timedelta(days=7)),
        "guest_count": request.guest_count or 0,
        "city": request.city,
        "status": request.status or "draft",
        "customizations": {
            "budget_range": request.budget_range,
            "style_preferences": request.style_preferences or []
        }
    }
    
    # Add user_id if authenticated, otherwise use a temporary/guest approach
    if current_user:
        event_data["user_id"] = current_user.id
    else:
        # For unauthenticated users, we still create the event but it won't be linked
        # In production, you might want to require authentication
        # For now, we'll use a special user_id (1) or handle this differently
        event_data["user_id"] = 1  # Default/guest user
    
    new_event = Event(**event_data)
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    # Build response
    return MyEventDetailResponse(
        id=new_event.id,
        event_name=new_event.event_name,
        event_type=new_event.event_type,
        event_date=new_event.event_date,
        event_duration_hours=new_event.event_duration_hours or 4,
        guest_count=new_event.guest_count or 0,
        event_notes=new_event.event_notes,
        venue_id=new_event.venue_id,
        venue_name=None,
        template_id=new_event.template_id,
        template_name=None,
        customizations=new_event.customizations,
        status=new_event.status,
        estimated_budget=float(new_event.estimated_budget) if new_event.estimated_budget else None,
        final_price=float(new_event.final_price) if new_event.final_price else None,
        address=new_event.address,
        city=new_event.city,
        created_at=new_event.created_at
    )

@app.get("/api/events", response_model=List[MyEventListResponse])
def list_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all events (public endpoint for testing)"""
    events = db.query(Event).offset(skip).limit(limit).all()
    
    result = []
    for e in events:
        venue_name = None
        if e.venue_id:
            venue = db.query(Venue).filter(Venue.id == e.venue_id).first()
            venue_name = venue.name if venue else None
        
        template_name = None
        if e.template_id:
            template = db.query(Template).filter(Template.id == e.template_id).first()
            template_name = template.name if template else None
        
        result.append(MyEventListResponse(
            id=e.id,
            event_name=e.event_name,
            event_type=e.event_type,
            event_date=e.event_date,
            guest_count=e.guest_count,
            status=e.status,
            venue_name=venue_name,
            template_name=template_name,
            final_price=float(e.final_price) if e.final_price else None,
            created_at=e.created_at
        ))
    
    return result

@app.get("/api/my/events", response_model=List[MyEventListResponse])
def list_my_events(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List current user's events"""
    query = db.query(Event).filter(Event.user_id == current_user.id)
    
    if status:
        query = query.filter(Event.status == status)
    
    events = query.order_by(Event.created_at.desc()).all()
    
    result = []
    for e in events:
        venue_name = None
        if e.venue_id:
            venue = db.query(Venue).filter(Venue.id == e.venue_id).first()
            venue_name = venue.name if venue else None
        
        template_name = None
        if e.template_id:
            template = db.query(Template).filter(Template.id == e.template_id).first()
            template_name = template.name if template else None
        
        result.append(MyEventListResponse(
            id=e.id,
            event_name=e.event_name,
            event_type=e.event_type,
            event_date=e.event_date,
            guest_count=e.guest_count,
            status=e.status,
            venue_name=venue_name,
            template_name=template_name,
            final_price=float(e.final_price) if e.final_price else None,
            created_at=e.created_at
        ))
    
    return result

@app.get("/api/my/events/{event_id}", response_model=MyEventDetailResponse)
def get_my_event_detail(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get event details"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.user_id == current_user.id
    ).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    venue_name = None
    if event.venue_id:
        venue = db.query(Venue).filter(Venue.id == event.venue_id).first()
        venue_name = venue.name if venue else None
    
    template_name = None
    if event.template_id:
        template = db.query(Template).filter(Template.id == event.template_id).first()
        template_name = template.name if template else None
    
    return MyEventDetailResponse(
        id=event.id,
        event_name=event.event_name,
        event_type=event.event_type,
        event_date=event.event_date,
        event_duration_hours=event.event_duration_hours,
        guest_count=event.guest_count,
        event_notes=event.event_notes,
        venue_id=event.venue_id,
        venue_name=venue_name,
        template_id=event.template_id,
        template_name=template_name,
        customizations=event.customizations,
        status=event.status,
        estimated_budget=float(event.estimated_budget) if event.estimated_budget else None,
        final_price=float(event.final_price) if event.final_price else None,
        address=event.address,
        city=event.city,
        created_at=event.created_at
    )

@app.post("/api/events/{event_id}/album")
def upload_event_album(
    event_id: int,
    request: AlbumUploadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload photos to event album"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.user_id == current_user.id
    ).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    added_photos = []
    for media_id in request.media_ids:
        media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
        if not media:
            continue
        
        album_item = EventAlbum(
            event_id=event_id,
            media_id=media_id,
            album_type=request.album_type,
            caption=request.caption,
            uploaded_by=current_user.id
        )
        db.add(album_item)
        added_photos.append(media_id)
    
    db.commit()
    
    return {"message": "Album photos uploaded", "added_count": len(added_photos), "media_ids": added_photos}

# Share & Attribution Endpoints

@app.post("/api/shares", response_model=ShareResponse)
def create_share(
    request: ShareCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new share link"""
    
    # Generate unique share code
    for _ in range(10):
        share_code = generate_share_code()
        existing = db.query(Share).filter(Share.share_code == share_code).first()
        if not existing:
            break
    else:
        raise HTTPException(status_code=500, detail="Failed to generate unique share code")
    
    # Hash password if provided
    password_hash = None
    if request.password:
        password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    
    # Get target data based on type
    target_data = {}
    if request.share_type == "event":
        event = db.query(Event).filter(Event.id == request.target_id).first()
        if event:
            target_data = {"event_name": event.event_name, "event_type": event.event_type}
    elif request.share_type == "template":
        template = db.query(Template).filter(Template.id == request.target_id).first()
        if template:
            target_data = {"template_name": template.name, "category": template.category}
    
    expires_at = None
    if request.expires_days:
        expires_at = datetime.utcnow() + timedelta(days=request.expires_days)
    
    share = Share(
        share_code=share_code,
        share_type=request.share_type,
        target_id=request.target_id,
        target_data=target_data,
        created_by=current_user.id,
        title=request.title,
        description=request.description,
        expires_at=expires_at,
        max_uses=request.max_uses,
        password_hash=password_hash,
        reward_enabled=request.reward_enabled
    )
    
    db.add(share)
    db.commit()
    db.refresh(share)
    
    return ShareResponse(
        id=share.id,
        share_code=share.share_code,
        share_type=share.share_type,
        target_id=share.target_id,
        title=share.title,
        description=share.description,
        cover_image_url=share.cover_image_url,
        share_url=f"/s/{share.share_code}",
        expires_at=share.expires_at,
        is_active=share.is_active,
        view_count=share.view_count,
        click_count=share.click_count,
        created_at=share.created_at
    )

@app.get("/s/{share_code}", response_class=HTMLResponse)
def get_share_landing_page(
    share_code: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """H5 landing page for share link"""
    share = db.query(Share).filter(
        Share.share_code == share_code,
        Share.is_active == True
    ).first()
    
    if not share:
        return HTMLResponse(content="<h1>Share not found</h1>", status_code=404)
    
    if share.expires_at and share.expires_at < datetime.utcnow():
        return HTMLResponse(content="<h1>This share link has expired</h1>", status_code=410)
    
    # Record view event
    share.view_count += 1
    db.commit()
    
    # Generate simple HTML page (in production, would be a proper React/Vue page)
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{share.title or 'PartyOnce Share'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .content {{ background: #f5f5f5; padding: 20px; border-radius: 8px; }}
            .btn {{ display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; 
                   text-decoration: none; border-radius: 4px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{share.title or 'PartyOnce'}</h1>
        </div>
        <div class="content">
            <p>{share.description or 'Check out this amazing event on PartyOnce!'}</p>
            <p>Share Type: {share.share_type}</p>
            <center>
                <a href="/api/shares/{share.share_code}/track?event_type=click" class="btn">View Details</a>
            </center>
        </div>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)

@app.post("/api/shares/{share_code}/track")
def track_share_event(
    share_code: str,
    request: ShareTrackRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Track events from share links
    - click: 匿名可用，10分钟去重(device_id > visitor_ip)
    - signup/deposit: 必须JWT认证
    """
    share = db.query(Share).filter(Share.share_code == share_code).first()
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    
    event_type = request.event_type
    
    # ==================== CLICK 事件 ====================
    if event_type == "click":
        # 10分钟去重检查
        dedup_key = request.visitor_fingerprint or request.visitor_ip or "unknown"
        
        # 检查10分钟内是否有相同去重键的记录
        ten_mins_ago = datetime.utcnow() - timedelta(minutes=10)
        existing = db.query(ShareEvent).filter(
            ShareEvent.share_id == share.id,
            ShareEvent.event_type == "click",
            ShareEvent.created_at >= ten_mins_ago
        ).filter(
            (ShareEvent.visitor_fingerprint == dedup_key) | 
            (ShareEvent.visitor_ip == request.visitor_ip)
        ).first()
        
        if existing:
            # 去重命中，不记录事件，不发奖励
            return {
                "message": "Event deduplicated",
                "event_type": "click",
                "deduplicated": True,
                "reward_amount": 0
            }
        
        # 记录click事件
        event = ShareEvent(
            share_id=share.id,
            share_code=share_code,
            event_type="click",
            visitor_ip=request.visitor_ip or "0.0.0.0",
            visitor_fingerprint=request.visitor_fingerprint,
            visitor_user_agent=request.visitor_user_agent,
            device_type=request.device_type,
            referrer_url=request.referrer_url,
            utm_source=request.utm_source,
            utm_medium=request.utm_medium,
            utm_campaign=request.utm_campaign
        )
        db.add(event)
        db.commit()
        
        # 触发click奖励($0.05)
        if share.reward_enabled:
            reward_amount = apply_share_reward(db, share, "click")
            return {
                "message": "Click tracked",
                "event_id": event.id,
                "event_type": "click",
                "deduplicated": False,
                "reward_amount": float(reward_amount)
            }
        
        return {
            "message": "Click tracked",
            "event_id": event.id,
            "event_type": "click",
            "deduplicated": False,
            "reward_amount": 0
        }
    
    # ==================== SIGNUP/DEPOSIT 事件 ====================
    # 必须JWT认证
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required for signup/deposit tracking")
    
    user_id = current_user.id
    
    if event_type == "signup":
        # 幂等检查：同一 share_id + user_id 只奖励一次
        existing = db.query(ShareEvent).filter(
            ShareEvent.share_id == share.id,
            ShareEvent.event_type == "signup",
            ShareEvent.user_id == user_id
        ).first()
        
        if existing:
            return {
                "message": "Signup already tracked",
                "event_type": "signup",
                "deduplicated": True,
                "reward_amount": 0
            }
        
        # 写 user_referrals
        referral = UserReferral(
            user_id=user_id,
            share_id=share.id,
            referrer_user_id=share.created_by
        )
        db.add(referral)
        
        # 记录signup事件
        event = ShareEvent(
            share_id=share.id,
            share_code=share_code,
            event_type="signup",
            user_id=user_id,
            visitor_ip=request.visitor_ip or "0.0.0.0"
        )
        db.add(event)
        db.commit()
        
        # 触发signup奖励($1)
        reward_amount = 0
        if share.reward_enabled:
            reward_amount = apply_share_reward(db, share, "signup", user_id=user_id)
        
        return {
            "message": "Signup tracked",
            "event_id": event.id,
            "event_type": "signup",
            "deduplicated": False,
            "reward_amount": float(reward_amount)
        }
    
    elif event_type == "deposit":
        # 幂等检查：同一 share_id + user_id 只奖励一次
        existing = db.query(ShareEvent).filter(
            ShareEvent.share_id == share.id,
            ShareEvent.event_type == "deposit",
            ShareEvent.user_id == user_id
        ).first()
        
        if existing:
            return {
                "message": "Deposit already tracked",
                "event_type": "deposit",
                "deduplicated": True,
                "reward_amount": 0
            }
        
        # 记录deposit事件，包含order_id
        event = ShareEvent(
            share_id=share.id,
            share_code=share_code,
            event_type="deposit",
            user_id=user_id,
            order_id=request.order_id,
            event_value=request.event_value,
            visitor_ip=request.visitor_ip or "0.0.0.0"
        )
        db.add(event)
        db.commit()
        
        # 触发deposit奖励($20)
        reward_amount = 0
        if share.reward_enabled:
            reward_amount = apply_share_reward(db, share, "deposit", user_id=user_id, order_id=request.order_id)
        
        return {
            "message": "Deposit tracked",
            "event_id": event.id,
            "event_type": "deposit",
            "order_id": request.order_id,
            "deduplicated": False,
            "reward_amount": float(reward_amount)
        }
    
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported event type: {event_type}")

# Wallet Endpoints

@app.get("/api/wallet", response_model=WalletResponse)
def get_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's wallet"""
    wallet = get_or_create_wallet(db, current_user.id, "user")
    
    return WalletResponse(
        id=wallet.id,
        available_balance=float(wallet.available_balance),
        frozen_balance=float(wallet.frozen_balance),
        total_earned=float(wallet.total_earned),
        total_withdrawn=float(wallet.total_withdrawn),
        currency=wallet.currency,
        status=wallet.status
    )

@app.get("/api/wallet/ledger", response_model=List[WalletLedgerResponse])
def get_wallet_ledger(
    transaction_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get wallet transaction history"""
    try:
        # 获取或创建 wallet
        wallet = db.query(Wallet).filter(
            Wallet.owner_id == current_user.id,
            Wallet.owner_type == "user"
        ).first()
        
        if not wallet:
            # 如果没有 wallet，返回空列表
            return []
        
        # 直接查询 wallet_ledger，假设使用 wallet_id 列
        query = db.query(WalletLedger).filter(WalletLedger.wallet_id == wallet.id)

        if transaction_type:
            query = query.filter(WalletLedger.transaction_type == transaction_type)

        entries = query.order_by(WalletLedger.created_at.desc()).offset(skip).limit(limit).all()

        return [
            WalletLedgerResponse(
                id=e.id,
                transaction_type=e.transaction_type,
                direction=e.direction,
                amount=float(e.amount),
                balance_before=float(e.balance_before),
                balance_after=float(e.balance_after),
                description=e.description,
                reference_number=e.reference_number,
                status=e.status,
                created_at=e.created_at
            )
            for e in entries
        ]
    
    except Exception as e:
        print(f"[ERROR] Wallet ledger error: {str(e)}")
        import traceback
        traceback.print_exc()
        # 返回空列表而不是 500 错误
        return []


# ==================== SUPPLIER APIs (Phase 2) ====================

class SupplierListItem(BaseModel):
    supplier_id: int
    name: str
    category_level_1: str
    category_level_2: Optional[str]
    suburb: str
    lat: Optional[float]
    lng: Optional[float]
    price_level: Optional[str]
    max_capacity: Optional[int]
    rating: float
    review_count: int
    cover_image_url: Optional[str]
    service_tags: Optional[List[str]]
    distance_km: Optional[float] = None
    
    class Config:
        from_attributes = True

@app.get("/api/suppliers/nearby", response_model=Dict[str, Any])
def get_nearby_suppliers(
    lat: float = Query(..., description="用户位置纬度"),
    lng: float = Query(..., description="用户位置经度"),
    radius_km: float = Query(10.0, description="搜索半径（公里）"),
    category: Optional[str] = Query(None, description="分类过滤"),
    price_levels: Optional[str] = Query(None, description="价格档位（逗号分隔）"),
    tags: Optional[str] = Query(None, description="标签过滤（逗号分隔）"),
    weekend_only: bool = Query(False, description="仅周末可服务"),
    limit: int = Query(20, description="返回数量限制"),
    db: Session = Depends(get_db)
):
    """获取附近供应商（地图核心接口）"""
    
    # Haversine 公式计算距离
    # 简化为先查询范围内大致数据，再计算精确距离
    # 1度纬度 ≈ 111km
    lat_range = radius_km / 111.0
    lng_range = radius_km / (111.0 * abs(cos(radians(lat))))
    
    query = db.query(Supplier).filter(
        Supplier.lat.between(lat - lat_range, lat + lat_range),
        Supplier.lng.between(lng - lat_range, lat + lat_range),
        Supplier.is_active == True
    )
    
    if category:
        query = query.filter(Supplier.category_level_1 == category)
    
    if price_levels:
        levels = price_levels.split(',')
        query = query.filter(Supplier.price_level.in_(levels))
    
    if weekend_only:
        query = query.filter(Supplier.weekend_available == True)
    
    suppliers = query.all()
    
    # 计算精确距离并过滤
    from math import radians, cos, sin, asin, sqrt
    
    def haversine(lat1, lng1, lat2, lng2):
        """计算两点间距离（公里）"""
        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
        c = 2 * asin(sqrt(a))
        r = 6371  # 地球半径（公里）
        return c * r
    
    results = []
    for s in suppliers:
        if s.lat and s.lng:
            distance = haversine(lat, lng, float(s.lat), float(s.lng))
            if distance <= radius_km:
                results.append({
                    "supplier_id": s.supplier_id,
                    "name": s.name,
                    "category_level_1": s.category_level_1,
                    "category_level_2": s.category_level_2,
                    "suburb": s.suburb,
                    "lat": float(s.lat) if s.lat else None,
                    "lng": float(s.lng) if s.lng else None,
                    "price_level": s.price_level,
                    "max_capacity": s.max_capacity,
                    "rating": float(s.rating) if s.rating else 5.0,
                    "review_count": s.review_count,
                    "cover_image_url": s.cover_image_url,
                    "service_tags": s.service_tags,
                    "distance_km": round(distance, 1)
                })
    
    # 按距离排序
    results.sort(key=lambda x: x["distance_km"])
    
    return {
        "suppliers": results[:limit],
        "center_lat": lat,
        "center_lng": lng,
        "radius_km": radius_km,
        "total_count": len(results)
    }

@app.get("/api/suppliers", response_model=List[SupplierListItem])
def list_suppliers(
    category: Optional[str] = Query(None),
    suburb: Optional[str] = Query(None),
    price_level: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """列表查询供应商"""
    query = db.query(Supplier).filter(Supplier.is_active == True)
    
    if category:
        query = query.filter(Supplier.category_level_1 == category)
    if suburb:
        query = query.filter(Supplier.suburb.ilike(f"%{suburb}%"))
    if price_level:
        query = query.filter(Supplier.price_level == price_level)
    
    suppliers = query.offset(skip).limit(limit).all()
    
    return [
        SupplierListItem(
            supplier_id=s.supplier_id,
            name=s.name,
            category_level_1=s.category_level_1,
            category_level_2=s.category_level_2,
            suburb=s.suburb,
            lat=float(s.lat) if s.lat else None,
            lng=float(s.lng) if s.lng else None,
            price_level=s.price_level,
            max_capacity=s.max_capacity,
            rating=float(s.rating) if s.rating else 5.0,
            review_count=s.review_count,
            cover_image_url=s.cover_image_url,
            service_tags=s.service_tags,
            distance_km=None
        )
        for s in suppliers
    ]

@app.get("/api/suppliers/{supplier_id}", response_model=Dict[str, Any])
def get_supplier_detail(
    supplier_id: int,
    db: Session = Depends(get_db)
):
    """获取供应商详情"""
    supplier = db.query(Supplier).filter(
        Supplier.supplier_id == supplier_id,
        Supplier.is_active == True
    ).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    return {
        "supplier_id": supplier.supplier_id,
        "name": supplier.name,
        "category_level_1": supplier.category_level_1,
        "category_level_2": supplier.category_level_2,
        "contact_name": supplier.contact_name,
        "phone": supplier.phone,
        "whatsapp": supplier.whatsapp,
        "wechat": supplier.wechat,
        "email": supplier.email,
        "address": supplier.address,
        "suburb": supplier.suburb,
        "city": supplier.city,
        "lat": float(supplier.lat) if supplier.lat else None,
        "lng": float(supplier.lng) if supplier.lng else None,
        "service_radius_km": supplier.service_radius_km,
        "service_tags": supplier.service_tags,
        "style_tags": supplier.style_tags,
        "price_level": supplier.price_level,
        "min_order_amount": float(supplier.min_order_amount) if supplier.min_order_amount else None,
        "max_capacity": supplier.max_capacity,
        "business_hours": supplier.business_hours,
        "weekend_available": supplier.weekend_available,
        "urgent_order_supported": supplier.urgent_order_supported,
        "insurance_status": supplier.insurance_status,
        "abn": supplier.abn,
        "company_name": supplier.company_name,
        "invoice_supported": supplier.invoice_supported,
        "rating": float(supplier.rating) if supplier.rating else 5.0,
        "review_count": supplier.review_count,
        "cooperation_status": supplier.cooperation_status,
        "cover_image_url": supplier.cover_image_url,
        "gallery_images": supplier.gallery_images,
        "notes": supplier.notes,
        "created_at": supplier.created_at
    }

@app.post("/api/suppliers", response_model=Dict[str, Any])
def create_supplier(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建供应商（后台管理）"""
    # 简化为直接插入
    supplier = Supplier(
        name=request.get("name"),
        category_level_1=request.get("category_level_1", "场地类"),
        category_level_2=request.get("category_level_2"),
        contact_name=request.get("contact_name"),
        phone=request.get("phone"),
        email=request.get("email"),
        address=request.get("address"),
        suburb=request.get("suburb", "Sydney"),
        lat=request.get("lat"),
        lng=request.get("lng"),
        price_level=request.get("price_level"),
        max_capacity=request.get("max_capacity"),
        cover_image_url=request.get("cover_image_url"),
        service_tags=request.get("service_tags", []),
        cooperation_status="待开发"
    )
    
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    
    return {"supplier_id": supplier.supplier_id, "message": "Supplier created successfully"}


# ==================== MAIN ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
