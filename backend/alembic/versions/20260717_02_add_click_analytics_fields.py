"""add click analytics fields"""
from alembic import op
import sqlalchemy as sa
revision = "20260717_02"
down_revision = "20260717_01"
branch_labels = None
depends_on = None
def upgrade() -> None:
    with op.batch_alter_table("click_events") as batch:
        batch.alter_column("keyword_used", existing_type=sa.String(100), nullable=True)
        batch.add_column(sa.Column("classification",sa.String(20),server_default="unknown",nullable=False))
        batch.add_column(sa.Column("device_category",sa.String(20),server_default="unknown",nullable=False))
        batch.add_column(sa.Column("operating_system",sa.String(50),server_default="unknown",nullable=False))
        batch.add_column(sa.Column("browser",sa.String(80),server_default="unknown",nullable=False))
        batch.add_column(sa.Column("device_family",sa.String(100),server_default="unknown",nullable=False))
        batch.add_column(sa.Column("country",sa.String(10),nullable=True)); batch.add_column(sa.Column("city",sa.String(255),nullable=True))
        batch.add_column(sa.Column("language",sa.String(35),server_default="unknown",nullable=False)); batch.add_column(sa.Column("referrer_domain",sa.String(255),server_default="direct",nullable=False)); batch.add_column(sa.Column("visitor_hash",sa.String(64),nullable=True))
        batch.add_column(sa.Column("is_bot",sa.Boolean(),server_default=sa.false(),nullable=False)); batch.add_column(sa.Column("is_preview",sa.Boolean(),server_default=sa.false(),nullable=False)); batch.add_column(sa.Column("is_prefetch",sa.Boolean(),server_default=sa.false(),nullable=False)); batch.add_column(sa.Column("is_human",sa.Boolean(),server_default=sa.false(),nullable=False))
    op.execute("UPDATE click_events SET classification='human', is_human=true WHERE classification='unknown' AND request_method='GET'")
    for name, columns in (("ix_click_events_link_clicked_at",["link_id","clicked_at"]),("ix_click_events_link_human",["link_id","is_human"]),("ix_click_events_link_classification",["link_id","classification"]),("ix_click_events_device_category",["device_category"]),("ix_click_events_operating_system",["operating_system"]),("ix_click_events_browser",["browser"]),("ix_click_events_keyword_used",["keyword_used"]),("ix_click_events_referrer_domain",["referrer_domain"]),("ix_click_events_visitor_hash",["visitor_hash"])): op.create_index(name,"click_events",columns)
def downgrade() -> None:
    for name in ("ix_click_events_visitor_hash","ix_click_events_referrer_domain","ix_click_events_keyword_used","ix_click_events_browser","ix_click_events_operating_system","ix_click_events_device_category","ix_click_events_link_classification","ix_click_events_link_human","ix_click_events_link_clicked_at"): op.drop_index(name,table_name="click_events")
    with op.batch_alter_table("click_events") as batch:
        for name in ("is_human","is_prefetch","is_preview","is_bot","visitor_hash","referrer_domain","language","city","country","device_family","browser","operating_system","device_category","classification"): batch.drop_column(name)
        batch.alter_column("keyword_used",existing_type=sa.String(100),nullable=False)
