from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from datetime import datetime

# create Flask app
app = Flask (__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:Skittles16!@localhost/ecommerce_api'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Create database
db = SQLAlchemy(app)
# Create Marshmallow instance
ma = Marshmallow(app)

order_products = db.Table('order_products',
    db.Column('order_id', db.Integer, db.ForeignKey('orders.id'), primary_key=True),
    db.Column('product_id', db.Integer, db.ForeignKey('products.id'), primary_key=True)
)

# Models
class User (db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)

    orders = db.relationship('Order', back_populates='user')

class Product (db.Model):
    __tablename__ = 'products'    

    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)

class Order (db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    order_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    user = db.relationship('User', back_populates='orders')
    # Many to Many
    products = db.relationship('Product', secondary=order_products, backref='orders')


# Marshmallow Schemas
class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        include_fk = True

class ProductSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Product
        include_fk = True

class OrderSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Order
        include_fk = True        

# Schema Instances
user_schema = UserSchema()
users_schema = UserSchema(many=True)

product_schema = ProductSchema()
products_schema = ProductSchema(many=True)

order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)


# User Endpoints 
# triggers the function
@app.route('/users', methods=['GET'])
# what HTTP Method is being used
def get_users():
    # fetch all users
    users = User.query.all()
    #convert to JSON and return
    return users_schema.jsonify(users)

# single user id    
@app.route('/users/<id>', methods=['GET'])
def get_user(id):
    user = User.query.get_or_404(id)
    return user_schema.jsonify(user)

# Create a user endpoint
@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    
    new_user = User(name=data['name'], address=data['address'], email=data['email'])
    db.session.add(new_user)
    db.session.commit()
    return user_schema.jsonify(new_user)

# update a user
@app.route('/users/<id>', methods=['PUT'])
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.json

    user.name = data['name']
    user.address = data['address']
    user.email = data['email']

    db.session.commit()
    return user_schema.jsonify(user)

# delete a user
@app.route('/users/<id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return user_schema.jsonify(user)

# Product Endpoints
@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return products_schema.jsonify(products)

# get single product
@app.route('/products/<id>', methods=['GET'])
def get_product(id):
    product = Product.query.get_or_404(id)
    return product_schema.jsonify(product)

# create product
@app.route('/products', methods=['POST'])
def create_product():
    data = request.json
    new_product = Product(product_name=data['product_name'], price=data['price'])
    db.session.add(new_product)
    db.session.commit()
    return product_schema.jsonify(new_product)

# update product
@app.route('/products/<id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.json
    product.product_name = data['product_name']
    product.price = data['price']
    db.session.commit()
    return product_schema.jsonify(product)

# delete product
@app.route('/products/<id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()
    return product_schema.jsonify(product)

# Create an order
@app.route('/orders', methods=['POST'])
def create_order():
    data = request.json
    new_order = Order(order_date=datetime.utcnow(), user_id=data['user_id'])
    db.session.add(new_order)
    db.session.commit()
    return order_schema.jsonify(new_order)

# Add product to order
@app.route('/orders/<order_id>/add_product/<product_id>', methods=['PUT'])
def add_product(order_id, product_id):
    order = Order.query.get_or_404(order_id)
    product = Product.query.get_or_404(product_id)
    order.products.append(product)
    db.session.commit()
    return order_schema.jsonify(order)

# Remove product from order
@app.route('/orders/<order_id>/remove_product/<product_id>', methods=['DELETE'])
def remove_product(order_id, product_id):
    order = Order.query.get_or_404(order_id)
    product = Product.query.get_or_404(product_id)
    order.products.remove(product)
    db.session.commit()
    return order_schema.jsonify(order)

# Get all orders for a user
@app.route('/orders/user/<user_id>', methods=['GET'])
def get_user_orders(user_id):
    orders = Order.query.filter_by(user_id=user_id).all()
    return orders_schema.jsonify(orders)

# Get all products for an order
@app.route('/orders/<order_id>/products', methods=['GET'])
def get_order_products(order_id):
    order = Order.query.get_or_404(order_id)
    return products_schema.jsonify(order.products)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)