"""empty message

Revision ID: b3e4418689d3
Revises: bf65a720f13c
Create Date: 2018-07-21 21:58:58.435414

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b3e4418689d3'
down_revision = 'bf65a720f13c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('stock_daily', 'high_price')
    op.drop_column('stock_daily', 'open_price')
    op.drop_column('stock_daily', 'close_price')
    op.drop_column('stock_daily', 'low_price')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('stock_daily', sa.Column('low_price', sa.INTEGER(), autoincrement=False, nullable=True))
    op.add_column('stock_daily', sa.Column('close_price', sa.INTEGER(), autoincrement=False, nullable=True))
    op.add_column('stock_daily', sa.Column('open_price', sa.INTEGER(), autoincrement=False, nullable=True))
    op.add_column('stock_daily', sa.Column('high_price', sa.INTEGER(), autoincrement=False, nullable=True))
    # ### end Alembic commands ###
