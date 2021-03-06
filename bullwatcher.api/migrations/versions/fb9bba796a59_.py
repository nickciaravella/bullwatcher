"""empty message

Revision ID: fb9bba796a59
Revises: a1c2bf125ac9
Create Date: 2018-09-17 21:42:54.425848

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'fb9bba796a59'
down_revision = 'a1c2bf125ac9'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user_order',
    sa.Column('order_id', postgresql.UUID(), nullable=False),
    sa.Column('user_id', sa.String(length=128), nullable=False),
    sa.Column('ticker', sa.String(length=10), nullable=False),
    sa.Column('order_type', sa.String(length=64), nullable=False),
    sa.Column('executed_at', sa.DateTime(), nullable=False),
    sa.Column('price', sa.Float(), nullable=False),
    sa.Column('shares', sa.Float(), nullable=False),
    sa.Column('fees', sa.Float(), nullable=False),
    sa.Column('account', sa.String(length=256), nullable=True),
    sa.Column('last_updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('order_id')
    )
    op.create_table('user_watchlist',
    sa.Column('watchlist_id', sa.BigInteger(), nullable=False),
    sa.Column('user_id', sa.String(length=128), nullable=False),
    sa.Column('display_name', sa.String(length=256), nullable=False),
    sa.Column('items_last_updated_at', sa.DateTime(), nullable=False),
    sa.Column('last_updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('watchlist_id')
    )
    op.create_table('user_watchlist_item',
    sa.Column('watchlist_id', postgresql.UUID(), nullable=False),
    sa.Column('ticker', sa.String(length=10), nullable=False),
    sa.Column('user_id', sa.String(length=128), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('watchlist_id', 'ticker')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user_watchlist_item')
    op.drop_table('user_watchlist')
    op.drop_table('user_order')
    # ### end Alembic commands ###
