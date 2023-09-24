// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
	uint256 public feePercent;

	mapping(address => mapping(address => uint256)) public tokens;
	
	// Orders Mapping
	mapping(uint256 => _Order) public orders;
	uint256 public orderCount;

	event Deposit(
        address token,
        address user,
        uint256 amount,
		uint256 balance
    );

	event Withdraw(
        address token,
        address user,
        uint256 amount,
		uint256 balance
    );

	event Order(
		uint256 id,
		address user,
		address tokenGet,
		uint256 amountGet,
		address tokenGive,
		uint256 amountGive,
		uint256 timestamp
		);

	// Way to model the order
	struct _Order {
		// Attributes of an order
		uint256 id; // Unique identifier for order
		address user; // User who made order
		address tokenGet; // Address of the token they receive
		uint256 amountGet; // Amount they receive
		address tokenGive; // Address of token they give
		uint256 amountGive; // Amount they give
		uint256 timestamp; // When order was created
	}


	constructor(address _feeAccount, uint256 _feePercent) {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}


	// ------------------------------
	// DEPOSIT & WITHRDRAW TOKEN
	function depositToken(address _token, uint256 _amount) public {
		// Transfer tokens to exchange
		require(Token(_token).transferFrom(msg.sender, address(this), _amount), 'transfer did not happen');
		
		// Update user balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
		
		// Emit an event
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	// Withdraw Tokens
	function withdrawToken(address _token, uint256 _amount) public {
		// Ensure user has enough tokens to withdraw
		require(tokens[_token][msg.sender] >= _amount);
		
		// Transfer tokens to user
		Token(_token).transfer(msg.sender, _amount);

		// Update user balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

		// Emit an event
		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	// Check Balances
	function balanceOf(address _token, address _user)
		public
		view
		returns (uint256)
	{
		return tokens[_token][_user];
	}
	

	//-------------------------
	// MAKE & CANCEL ORDERS

	function makeOrder
	(
		address _tokenGet,
		uint256 _amountGet, 
		address _tokenGive, 
		uint256 _amountGive
	) public {
		// Token Give ( the token they want to spend) - which token and how much?
		// Token Get (the token they want to receive) - which token and how much?

		// Require token balance
		require(balanceOf(_tokenGive, msg.sender) >= _amountGive);
		
		// CREATE ORDER
		orderCount = orderCount + 1;

		orders[orderCount] = _Order(
			orderCount, //id
			msg.sender, // user
			_tokenGet, // tokenGet
			_amountGet, // amountGet
			_tokenGive, // tokenGive
			_amountGive, // amountGive
			block.timestamp // timestamp
		);

		emit Order(
			orderCount,
			msg.sender,
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp);

		// Emit event
	}

	// Fill Orders
	// Charge Fees
}
