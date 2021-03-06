import React from 'react';
import propTypes from 'prop-types';
import {FontIcon, DefaultButton, PrimaryButton, IconButton, ActionButton, TextField, Stack, Shimmer} from 'office-ui-fabric-react';
import ImageGallery from './imageGallery';
import Barcode from './barcode';

class ProductComponent extends React.Component {
    constructor(props) {
        super(props);

        this.toggleEdit = this.toggleEdit.bind(this);
        this.onSave = this.onSave.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleAddImageUrl = this.handleAddImageUrl.bind(this);
        this.handleEditImageUrl = this.handleEditImageUrl.bind(this);
        this.handleDeleteImageUrl = this.handleDeleteImageUrl.bind(this);

        this.state = {
            isEditing: false,
            editted: {
                name: '',
                brand: '',
                category: '',
                freeText: '',
                price: '',
                studentDiscount: '',
                amount: '',
                imageUrls: props.imageUrls ? [...props.imageUrls] : [],
            },
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.imageUrls !== this.props.imageUrls) {
            this.setState(prevState => ({
                ...prevState,
                editted: {
                    ...prevState.editted,
                    imageUrls: [...this.props.imageUrls],
                },
            }));
        }
    }

    toggleEdit() {
        this.setState(prevState => ({
            ...prevState,
            isEditing: !prevState.isEditing,
        }));
        if ((this.props.isEditing || this.state.isEditing) && this.props.onCancelEdit) {
            this.props.onCancelEdit();
        }
    }

    onSave() {
        const calculateDelta = () => {
            const delta = {barcode: this.props.barcode};
            const addIfChanged = (key, val) => {
                if (val && val !== '') {
                    delta[key] = val;
                }
            };
            ['name', 'brand', 'category', 'freeText', 'price', 'studentDiscount']
                .forEach(key => addIfChanged(key, this.state.editted[key]));
            if (JSON.stringify(this.state.editted.imageUrls) !== JSON.stringify(this.props.imageUrls)) {
                delta.imageUrls = this.state.editted.imageUrls;
            }
            return delta;
        };
        const delta = calculateDelta();

        if (this.state.amount !== '' && this.props.onChangeAmount) {
            this.props.onChangeAmount(this.state.editted.amount);
        }
        if (this.props.onEdit) {
            this.props.onEdit(delta);
        }
        this.toggleEdit();
        this.setState(prevState => ({
            ...prevState,
            editted: {
                ...prevState.editted,
                name: '',
                brand: '',
                category: '',
                freeText: '',
                price: '',
                studentDiscount: '',
                amount: '',
            },
        }));
    }

    handleAddImageUrl() {
        this.setState(prevState => ({
            ...prevState,
            editted: {
                ...prevState.editted,
                imageUrls: ['', ...prevState.editted.imageUrls],
            },
        }));
    }

    handleEdit(key) {
        return (e, val) => {
            this.setState(prevState => ({
                ...prevState,
                editted: {
                    ...prevState.editted,
                    [key]: val,
                },
            }));
        };
    }

    handleEditImageUrl(index) {
        return (e, val) => {
            this.setState(prevState => ({
                ...prevState,
                editted: {
                    ...prevState.editted,
                    imageUrls: [
                        ...prevState.editted.imageUrls.slice(0, index),
                        val,
                        ...prevState.editted.imageUrls.slice(index + 1),
                    ],
                },
            }));
        };
    }

    handleDeleteImageUrl(index) {
        return () => {
            this.setState(prevState => ({
                ...prevState,
                editted: {
                    ...prevState.editted,
                    imageUrls: [
                        ...prevState.editted.imageUrls.slice(0, index),
                        ...prevState.editted.imageUrls.slice(index + 1),
                    ],
                },
            }));
        };
    }

    render() {
        if (this.props.isEditing || this.state.isEditing) {
            return (
                <div className="product">
                    <div className="header">
                        <div className="name">
                            <TextField
                                label="Name"
                                value={this.state.editted.name || this.props.name}
                                onChange={this.handleEdit('name')}
                            />
                        </div>
                        <div className="brand">
                            <TextField
                                label="Brand"
                                value={this.state.editted.brand || this.props.brand}
                                onChange={this.handleEdit('brand')}
                            />
                        </div>
                        <div className="category">
                            <TextField
                                label="Category"
                                value={this.state.editted.category || this.props.category}
                                onChange={this.handleEdit('category')}
                            />
                        </div>
                    </div>
                    <div className="body">
                        {this.props.imageUrls !== undefined && (
                            <React.Fragment>
                                <ActionButton
                                    iconProps={{iconName: 'plus'}}
                                    onClick={this.handleAddImageUrl}
                                >
                                    Add image
                                </ActionButton>
                                {this.state.editted.imageUrls.map((url, index) =>
                                    <Stack horizontal key={index} style={{alignItems: 'flex-end'}}>
                                        <Stack.Item grow={1}>
                                            <TextField
                                                label="URL"
                                                value={url}
                                                onChange={this.handleEditImageUrl(index)}
                                            />
                                        </Stack.Item>
                                        <IconButton
                                            iconProps={{iconName: 'cancel'}}
                                            onClick={this.handleDeleteImageUrl(index)}
                                            style={{color: 'red'}}
                                        />
                                    </Stack>
                                )}
                            </React.Fragment>
                        )}
                        <div className="description">
                            <TextField
                                label="Description"
                                value={this.state.editted.freeText || this.props.freeText}
                                onChange={this.handleEdit('freeText')}
                                multiline
                            />
                        </div>
                    </div>
                    <div className="footer">
                        <Stack horizontal>
                            <TextField
                                label="Price"
                                value={this.state.editted.price || this.props.price}
                                onChange={this.handleEdit('price')}
                                iconProps={{iconName: 'shekel'}}
                            />
                            <TextField
                                label="Student Price"
                                value={this.state.editted.studentDiscount || this.props.studentDiscount}
                                onChange={this.handleEdit('studentDiscount')}
                                iconProps={{iconName: 'shekel'}}
                            />
                        </Stack>
                        {this.props.onChangeAmount &&
                            <TextField
                                label="Stock"
                                value={this.state.editted.amount || this.props.amount || ''}
                                onChange={this.handleEdit('amount')}
                            />
                        }
                        <Stack horizontal>
                            <DefaultButton
                                text="Cancel"
                                onClick={this.toggleEdit}
                                iconProps={{iconName: 'cancel'}}
                            />
                            <PrimaryButton
                                text="Save"
                                onClick={this.onSave}
                                iconProps={{iconName: 'save'}}
                            />
                            {this.props.onDeleteProduct && (
                                <DefaultButton
                                    text="Delete"
                                    onClick={this.props.onDeleteProduct}
                                />
                            )}
                        </Stack>
                    </div>
                </div>
            );
        }

        return (
            <div className="product">
                <div className="header">
                    <div className="name">
                        <Shimmer isDataLoaded={!this.props.isLoading}>
                            {this.props.name}
                        </Shimmer>
                    </div>
                    <div className="brand">
                        <Shimmer isDataLoaded={!this.props.isLoading}>
                            {this.props.brand}
                        </Shimmer>
                    </div>
                    <div className="category">
                        <Shimmer isDataLoaded={!this.props.isLoading}>
                            {this.props.category}
                        </Shimmer>
                    </div>
                    {this.props.isEditable && !this.props.isLoading && (
                        <IconButton
                            onClick={this.toggleEdit}
                            iconProps={{iconName: 'edit'}}
                        />
                    )}
                </div>
                <div className="body">
                    <Shimmer isDataLoaded={!this.props.isLoading}>
                        <ImageGallery
                            imageUrls={this.props.imageUrls}
                        />
                        <div className="description">{this.props.freeText}</div>
                    </Shimmer>
                </div>
                <div className="footer">
                    <div className="price">
                        <Shimmer isDataLoaded={!this.props.isLoading}>
                            {this.props.isStudent ? (
                                <React.Fragment>
                                    <span className="strike">{this.props.price}</span>
                                    {this.props.studentDiscount}
                                </React.Fragment>
                            ) : (
                                this.props.price
                            )}
                            <FontIcon className="icon" iconName="shekel"/>
                        </Shimmer>
                    </div>
                    <div className="cartControl">
                        <Shimmer isDataLoaded={!this.props.isLoading}>
                            {this.props.isAvailable ? (
                                <DefaultButton
                                    iconProps={{iconName: 'cartPlus'}}
                                    text="Add to cart"
                                    disabled={!this.props.onAddToCart}
                                    onClick={this.props.onAddToCart}
                                />
                            ) : (
                                <div className="availability">Unavailable</div>
                            )}
                        </Shimmer>
                    </div>
                </div>
                {this.props.barcode !== undefined && (
                    <div className="barcode">
                        <Barcode
                            value={this.props.barcode}
                            height={16}
                            fontSize={10}
                            margin={0}
                            background="transparent"
                        />
                    </div>
                )}
            </div>
        );
    }
}

ProductComponent.propTypes = {
    barcode: propTypes.any,
    name: propTypes.string.isRequired,
    brand: propTypes.string.isRequired,
    category: propTypes.string.isRequired,
    freeText: propTypes.string.isRequired,
    price: propTypes.string.isRequired,
    studentDiscount: propTypes.string.isRequired,
    imageUrls: propTypes.array,
    amount: propTypes.number,
    isAvailable: propTypes.bool,
    isLoading: propTypes.bool,
    isStudent: propTypes.bool,
    isEditable: propTypes.bool,
    isEditing: propTypes.bool,
    onAddToCart: propTypes.func,
    onEdit: propTypes.func,
    onCancelEdit: propTypes.func,
    onDeleteProduct: propTypes.func,
    onChangeAmount: propTypes.func,
};

export default ProductComponent;
