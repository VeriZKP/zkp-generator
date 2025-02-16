// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegistration {
    address public admin;

    struct Institution {
        string preferredName;
        string idNumber;
        string title;
        string institution;
        string phoneNumber;
        string email;
    }

    struct User {
        string realName;
        bool isRegistered;
    }

    mapping(address => User) public users;
    mapping(address => Institution[]) public userInstitutions; // 🔥 Better way to store institutions

    address[] public userAddresses;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized: Admin only");
        _;
    }

    event UserRegistered(address indexed userAddress, string realName);
    event InstitutionAdded(address indexed userAddress, string institution, string title, string idNumber);

    constructor() {
        admin = msg.sender;
    }

    function registerUser(address _user, string memory _realName) public onlyAdmin {
        require(!users[_user].isRegistered, "User already registered");

        users[_user] = User(_realName, true);
        userAddresses.push(_user);

        emit UserRegistered(_user, _realName);
    }

    function addInstitution(
        address _user,
        string memory _preferredName,
        string memory _idNumber,
        string memory _title,
        string memory _institution,
        string memory _phoneNumber,
        string memory _email
    ) public onlyAdmin {
        require(users[_user].isRegistered, "User not registered");

        userInstitutions[_user].push(Institution(_preferredName, _idNumber, _title, _institution, _phoneNumber, _email));

        emit InstitutionAdded(_user, _institution, _title, _idNumber);
    }

    function getAllUsersWithInstitutions() public view returns (address[] memory, string[] memory, Institution[][] memory) {
        uint256 totalUsers = userAddresses.length;
        address[] memory userWallets = new address[](totalUsers);
        string[] memory userRealNames = new string[](totalUsers);
        Institution[][] memory allInstitutions = new Institution[][](totalUsers);

        for (uint256 i = 0; i < totalUsers; i++) {
            address userAddr = userAddresses[i];
            userWallets[i] = userAddr;
            userRealNames[i] = users[userAddr].realName;
            allInstitutions[i] = userInstitutions[userAddr];
        }

        return (userWallets, userRealNames, allInstitutions);
    }
}
