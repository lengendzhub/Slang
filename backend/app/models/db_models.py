from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Any
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Numeric,
    Integer,
    ForeignKey,
    DateTime,
    JSON,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# 1. Users
class DBUser(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    master_resumes = relationship("DBMasterResume", back_populates="user", cascade="all, delete-orphan")
    job_descriptions = relationship("DBJobDescription", back_populates="user")

# 2. Master Resumes
class DBMasterResume(Base):
    __tablename__ = "master_resumes"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    tex_source = Column(Text, nullable=False)
    template_id = Column(String(64), default="jakes_resume")
    parse_confidence = Column(Numeric(4, 2), default=1.00)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("DBUser", back_populates="master_resumes")
    profile_items = relationship("DBProfileItem", back_populates="master_resume", cascade="all, delete-orphan")
    variants = relationship("DBVariant", back_populates="master_resume", cascade="all, delete-orphan")

# 3. Profile Items
class DBProfileItem(Base):
    __tablename__ = "profile_items"

    id = Column(String(64), primary_key=True)
    master_id = Column(String(64), ForeignKey("master_resumes.id", ondelete="CASCADE"), nullable=False)
    section = Column(String(128), nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String(64), default="extracted")
    status = Column(String(32), default="extracted")  # extracted / confirmed
    locked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    master_resume = relationship("DBMasterResume", back_populates="profile_items")
    evidence_records = relationship("DBEvidence", back_populates="profile_item")

# 4. Evidence Bank
class DBEvidence(Base):
    __tablename__ = "evidence"

    id = Column(String(64), primary_key=True)
    profile_item_id = Column(String(64), ForeignKey("profile_items.id", ondelete="SET NULL"), nullable=True)
    text = Column(Text, nullable=False)
    skills = Column(JSON, default=list)
    domain = Column(String(128), default="Engineering")
    source = Column(String(64), default="master_resume")
    created_at = Column(DateTime, default=datetime.utcnow)

    profile_item = relationship("DBProfileItem", back_populates="evidence_records")

# 5. Job Descriptions
class DBJobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    raw_text = Column(Text, nullable=False)
    role = Column(String(255), nullable=False)
    seniority = Column(String(64), default="Mid-Level")
    domain = Column(String(128), default="Engineering")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("DBUser", back_populates="job_descriptions")
    requirements = relationship("DBRequirement", back_populates="job_description", cascade="all, delete-orphan")
    variants = relationship("DBVariant", back_populates="job_description", cascade="all, delete-orphan")

# 6. Requirements
class DBRequirement(Base):
    __tablename__ = "requirements"

    id = Column(String(64), primary_key=True)
    jd_id = Column(String(64), ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    kind = Column(String(16), default="must")  # must / nice
    category = Column(String(64), default="Essential")
    created_at = Column(DateTime, default=datetime.utcnow)

    job_description = relationship("DBJobDescription", back_populates="requirements")
    matches = relationship("DBMatch", back_populates="requirement", cascade="all, delete-orphan")

# 7. Matches
class DBMatch(Base):
    __tablename__ = "matches"

    id = Column(String(64), primary_key=True)
    requirement_id = Column(String(64), ForeignKey("requirements.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(32), nullable=False)  # direct, transferable, missing
    evidence_ids = Column(JSON, default=list)
    rationale = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    requirement = relationship("DBRequirement", back_populates="matches")

# 8. Variants
class DBVariant(Base):
    __tablename__ = "variants"

    id = Column(String(64), primary_key=True)
    master_id = Column(String(64), ForeignKey("master_resumes.id", ondelete="CASCADE"), nullable=False)
    jd_id = Column(String(64), ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False)
    mode = Column(String(64), default="Same career")
    tex = Column(Text, nullable=False)
    pdf_url = Column(Text, nullable=True)
    alignment_report = Column(JSON, default=dict)
    parent_variant_id = Column(String(64), ForeignKey("variants.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    master_resume = relationship("DBMasterResume", back_populates="variants")
    job_description = relationship("DBJobDescription", back_populates="variants")
    changes = relationship("DBChange", back_populates="variant", cascade="all, delete-orphan")
    compile_runs = relationship("DBCompileRun", back_populates="variant", cascade="all, delete-orphan")

# 9. Changes
class DBChange(Base):
    __tablename__ = "changes"

    id = Column(String(64), primary_key=True)
    variant_id = Column(String(64), ForeignKey("variants.id", ondelete="CASCADE"), nullable=False)
    section = Column(String(128), nullable=False)
    before = Column(Text, nullable=False)
    after = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    evidence_ids = Column(JSON, nullable=False, default=list)
    state = Column(String(32), default="pending")  # pending, accepted, rejected, edited
    created_at = Column(DateTime, default=datetime.utcnow)

    variant = relationship("DBVariant", back_populates="changes")

# 10. Compile Runs
class DBCompileRun(Base):
    __tablename__ = "compile_runs"

    id = Column(String(64), primary_key=True)
    variant_id = Column(String(64), ForeignKey("variants.id", ondelete="CASCADE"), nullable=False)
    ok = Column(Boolean, default=False)
    log = Column(Text, nullable=True)
    pages = Column(Integer, default=1)
    checks = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    variant = relationship("DBVariant", back_populates="compile_runs")
