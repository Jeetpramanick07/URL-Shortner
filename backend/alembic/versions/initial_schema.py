"""Create the Phase 1 schema.

Revision ID: 20260717_01
Revises: None
Create Date: 2026-07-17
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260717_01"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


SUPPORTED_COUNTRIES = (
    "IN",
    "US",
    "UK",
    "CA",
    "AU",
    "DE",
    "FR",
    "IT",
    "ES",
    "JP",
    "AE",
    "SA",
    "SG",
    "BR",
    "MX",
)


def upgrade() -> None:
    op.create_table(
        "domains",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("hostname", sa.String(length=255), nullable=False),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column(
            "is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_domains"),
    )
    op.create_index("ix_domains_hostname", "domains", ["hostname"], unique=True)

    supported = ", ".join(f"'{country}'" for country in SUPPORTED_COUNTRIES)
    op.create_table(
        "links",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column("domain_id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("asin", sa.String(length=10), nullable=False),
        sa.Column("target_country", sa.String(length=2), nullable=False),
        sa.Column("keywords", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("associate_tag", sa.String(length=100), nullable=True),
        sa.Column(
            "click_sequence",
            sa.BigInteger(),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column(
            "is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "asin ~ '^[A-Z0-9]{10}$'", name="ck_links_asin_format"
        ),
        sa.CheckConstraint(
            "slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'", name="ck_links_slug_format"
        ),
        sa.CheckConstraint(
            "click_sequence >= 0", name="ck_links_click_sequence_nonnegative"
        ),
        sa.CheckConstraint(
            "jsonb_typeof(keywords) = 'array' "
            "AND jsonb_array_length(keywords) BETWEEN 1 AND 20",
            name="ck_links_keywords_array_length",
        ),
        sa.CheckConstraint(
            f"target_country IN ({supported})", name="ck_links_target_country"
        ),
        sa.ForeignKeyConstraint(
            ["domain_id"],
            ["domains.id"],
            name="fk_links_domain_id_domains",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_links"),
        sa.UniqueConstraint("domain_id", "slug", name="uq_links_domain_slug"),
    )
    op.create_index("ix_links_asin", "links", ["asin"], unique=False)
    op.create_index("ix_links_domain_id", "links", ["domain_id"], unique=False)

    op.create_table(
        "click_events",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("link_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "clicked_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("keyword_used", sa.String(length=100), nullable=False),
        sa.Column("keyword_position", sa.Integer(), nullable=False),
        sa.Column("request_method", sa.String(length=10), nullable=False),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("referrer", sa.Text(), nullable=True),
        sa.Column("ip_hash", sa.String(length=64), nullable=True),
        sa.CheckConstraint(
            "keyword_position >= 0", name="ck_click_events_keyword_position"
        ),
        sa.ForeignKeyConstraint(
            ["link_id"],
            ["links.id"],
            name="fk_click_events_link_id_links",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_click_events"),
    )
    op.create_index(
        "ix_click_events_clicked_at", "click_events", ["clicked_at"], unique=False
    )
    op.create_index(
        "ix_click_events_link_id", "click_events", ["link_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index("ix_click_events_link_id", table_name="click_events")
    op.drop_index("ix_click_events_clicked_at", table_name="click_events")
    op.drop_table("click_events")
    op.drop_index("ix_links_domain_id", table_name="links")
    op.drop_index("ix_links_asin", table_name="links")
    op.drop_table("links")
    op.drop_index("ix_domains_hostname", table_name="domains")
    op.drop_table("domains")
