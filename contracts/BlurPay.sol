// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BlurPay
 * @notice Pay-to-reveal: создатели платят комиссию за публикацию, покупатели платят создателям за разблокировку.
 */
contract BlurPay is Ownable, ReentrancyGuard {
    uint256 public creationFeeWei;

    event CreationFeePaid(address indexed creator, string contentId);
    event ContentUnlocked(address indexed payer, string contentId);
    event CreationFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor() Ownable(msg.sender) {
        // ~$1 at 3000 ETH/USD: 0.000333 ETH
        creationFeeWei = 333000000000000 wei;
    }

    /**
     * @notice Оплата комиссии за создание контента ($1)
     * @param contentId Идентификатор контента (UUID)
     */
    function payCreationFee(string calldata contentId) external payable nonReentrant {
        require(msg.value >= creationFeeWei, "BlurPay: insufficient fee");
        require(bytes(contentId).length > 0, "BlurPay: empty contentId");

        payable(owner()).transfer(msg.value);
        emit CreationFeePaid(msg.sender, contentId);
    }

    /**
     * @notice Разблокировка контента — 100% суммы создателю
     * @param creator Адрес создателя контента
     * @param contentId Идентификатор контента
     */
    function unlockContent(
        address payable creator,
        string calldata contentId
    ) external payable nonReentrant {
        require(msg.value > 0, "BlurPay: zero payment");
        require(creator != address(0), "BlurPay: zero creator");
        require(bytes(contentId).length > 0, "BlurPay: empty contentId");

        creator.transfer(msg.value);
        emit ContentUnlocked(msg.sender, contentId);
    }

    /**
     * @notice Обновить комиссию за создание (только owner)
     */
    function setCreationFeeWei(uint256 _feeWei) external onlyOwner {
        uint256 oldFee = creationFeeWei;
        creationFeeWei = _feeWei;
        emit CreationFeeUpdated(oldFee, _feeWei);
    }

    receive() external payable {
        revert("BlurPay: use payCreationFee or unlockContent");
    }

    fallback() external payable {
        revert("BlurPay: use payCreationFee or unlockContent");
    }
}
