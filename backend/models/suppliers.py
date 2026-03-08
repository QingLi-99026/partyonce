from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date

# 供应商相关模型

class SupplierBase(BaseModel):
    name: str
    category_level_1: str
    category_level_2: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    wechat: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    suburb: str
    city: str = "Sydney"
    lat: Optional[float] = None
    lng: Optional[float] = None
    service_radius_km: int = 10
    service_tags: Optional[List[str]] = None
    style_tags: Optional[List[str]] = None
    price_level: Optional[str] = None
    max_capacity: Optional[int] = None
    weekend_available: bool = True
    urgent_order_supported: bool = False
    rating: float = 5.0
    review_count: int = 0
    cover_image_url: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    cooperation_status: Optional[str] = None
    priority_level: Optional[str] = None
    notes: Optional[str] = None

class SupplierResponse(SupplierBase):
    supplier_id: int
    cooperation_status: str
    priority_level: str
    gallery_images: Optional[List[str]] = None
    business_hours: Optional[dict] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class SupplierListResponse(BaseModel):
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
    distance_km: Optional[float] = None  # 计算出的距离

class SupplierSearchRequest(BaseModel):
    suburb: Optional[str] = None
    category_level_1: Optional[str] = None
    category_level_2: Optional[str] = None
    price_levels: Optional[List[str]] = None
    max_capacity_min: Optional[int] = None
    max_capacity_max: Optional[int] = None
    lat: Optional[float] = None  # 用户位置
    lng: Optional[float] = None
    radius_km: float = 10.0
    tags: Optional[List[str]] = None
    weekend_only: bool = False

class NearbySuppliersResponse(BaseModel):
    suppliers: List[SupplierListResponse]
    center_lat: float
    center_lng: float
    radius_km: float
    total_count: int
