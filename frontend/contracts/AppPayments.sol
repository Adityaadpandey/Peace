// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AppPayments is Ownable {
    // Events
    event PriceUpdated(uint256 indexed itemId, uint256 price);
    event PaymentReceived(address indexed payer, uint256 indexed itemId, uint256 amount);
    event ItemStatusChanged(uint256 indexed itemId, bool isActive);
    event PaymentWithdrawn(address indexed owner, uint256 amount);

    // Struct to store item details
    struct Item {
        uint256 price;
        bool isActive;
    }

    // Mapping to store items
    mapping(uint256 => Item) public items;

    // Constructor
    constructor() Ownable(msg.sender) {}

    // Modifier to check if item exists and is active
    modifier itemActive(uint256 _itemId) {
        require(items[_itemId].isActive, "Item is not active");
        _;
    }

    /**
     * @dev Sets the price for an item
     * @param _itemId The ID of the item
     * @param _price The price in BTTC (wei)
     */
    function setPrice(uint256 _itemId, uint256 _price) external onlyOwner {
        require(_price > 0, "Price must be greater than 0");
        items[_itemId].price = _price;
        items[_itemId].isActive = true;
        emit PriceUpdated(_itemId, _price);
    }

    /**
     * @dev Toggles the active status of an item
     * @param _itemId The ID of the item
     * @param _isActive The new status
     */
    function setItemStatus(uint256 _itemId, bool _isActive) external onlyOwner {
        require(items[_itemId].price > 0, "Item does not exist");
        items[_itemId].isActive = _isActive;
        emit ItemStatusChanged(_itemId, _isActive);
    }

    /**
     * @dev Returns the price of an item
     * @param _itemId The ID of the item
     */
    function getPrice(uint256 _itemId) external view itemActive(_itemId) returns (uint256) {
        return items[_itemId].price;
    }

    /**
     * @dev Process payment for an item
     * @param _itemId The ID of the item
     */
    function makePayment(uint256 _itemId) external payable itemActive(_itemId) {
        require(msg.value >= items[_itemId].price, "Insufficient payment");

        emit PaymentReceived(msg.sender, _itemId, msg.value);
    }

    /**
     * @dev Withdraw collected payments
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");

        emit PaymentWithdrawn(owner(), balance);
    }

    /**
     * @dev Get contract balance
     */
    function getBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }
}
