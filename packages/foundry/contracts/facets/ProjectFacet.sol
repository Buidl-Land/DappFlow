// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ProjectFacet {
    using Counters for Counters.Counter;

    // Diamond storage pattern
    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("diamond.projects.storage");

    struct Project {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 fundingGoal;
        uint256 raisedAmount;
        uint256 startTime;
        uint256 endTime;
        bool isFunded;
        mapping(address => uint256) contributions;
        Task[] tasks;
        uint256 totalTasks;
        mapping(uint256 => bool) taskCompleted;
        mapping(uint256 => address) taskAssignee;
        ProjectStatus status;
    }

    struct Task {
        uint256 id;
        string title;
        string description;
        uint256 reward;
        uint256 deadline;
        TaskStatus status;
        string[] requiredSkills;
        uint256 estimatedHours;
    }

    enum ProjectStatus {
        Active,
        Funded,
        Completed,
        Failed
    }

    enum TaskStatus {
        Open,
        Assigned,
        InProgress,
        Completed,
        Verified
    }

    struct DiamondStorage {
        address usdtToken;
        Counters.Counter projectIds;
        mapping(uint256 => Project) projects;
        mapping(address => uint256[]) userProjects;
        mapping(address => uint256[]) userTasks;
    }

    event ProjectCreated(uint256 indexed projectId, address indexed creator, string title, uint256 fundingGoal);
    event ProjectFunded(uint256 indexed projectId, address indexed contributor, uint256 amount);
    event TaskCreated(uint256 indexed projectId, uint256 indexed taskId, string title, uint256 reward);
    event TaskAssigned(uint256 indexed projectId, uint256 indexed taskId, address indexed assignee);
    event TaskCompleted(uint256 indexed projectId, uint256 indexed taskId, address indexed assignee);
    event TaskVerified(uint256 indexed projectId, uint256 indexed taskId, address indexed verifier);

    function diamondStorage() internal pure returns (DiamondStorage storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    function initialize(address _usdtToken) external {
        DiamondStorage storage ds = diamondStorage();
        require(ds.usdtToken == address(0), "Already initialized");
        ds.usdtToken = _usdtToken;
    }

    function createProject(
        string calldata _title,
        string calldata _description,
        uint256 _fundingGoal,
        uint256 _duration
    ) external returns (uint256) {
        DiamondStorage storage ds = diamondStorage();
        ds.projectIds.increment();
        uint256 newProjectId = ds.projectIds.current();

        Project storage project = ds.projects[newProjectId];
        project.id = newProjectId;
        project.creator = msg.sender;
        project.title = _title;
        project.description = _description;
        project.fundingGoal = _fundingGoal;
        project.startTime = block.timestamp;
        project.endTime = block.timestamp + _duration;
        project.status = ProjectStatus.Active;

        ds.userProjects[msg.sender].push(newProjectId);

        emit ProjectCreated(newProjectId, msg.sender, _title, _fundingGoal);
        return newProjectId;
    }

    function contribute(uint256 _projectId, uint256 _amount) external {
        DiamondStorage storage ds = diamondStorage();
        Project storage project = ds.projects[_projectId];
        require(block.timestamp <= project.endTime, "Funding period ended");
        require(project.status == ProjectStatus.Active, "Project not active");

        IERC20(ds.usdtToken).transferFrom(msg.sender, address(this), _amount);
        project.contributions[msg.sender] += _amount;
        project.raisedAmount += _amount;

        if (project.raisedAmount >= project.fundingGoal) {
            project.status = ProjectStatus.Funded;
            project.isFunded = true;
        }

        emit ProjectFunded(_projectId, msg.sender, _amount);
    }

    function createTask(
        uint256 _projectId,
        string calldata _title,
        string calldata _description,
        uint256 _reward,
        uint256 _deadline,
        string[] calldata _requiredSkills,
        uint256 _estimatedHours
    ) external returns (uint256) {
        DiamondStorage storage ds = diamondStorage();
        Project storage project = ds.projects[_projectId];
        require(msg.sender == project.creator, "Only creator can add tasks");
        require(project.isFunded, "Project not funded");

        uint256 taskId = project.totalTasks++;
        Task memory newTask = Task({
            id: taskId,
            title: _title,
            description: _description,
            reward: _reward,
            deadline: _deadline,
            status: TaskStatus.Open,
            requiredSkills: _requiredSkills,
            estimatedHours: _estimatedHours
        });

        project.tasks.push(newTask);
        emit TaskCreated(_projectId, taskId, _title, _reward);
        return taskId;
    }

    function assignTask(uint256 _projectId, uint256 _taskId, address _assignee) external {
        DiamondStorage storage ds = diamondStorage();
        Project storage project = ds.projects[_projectId];
        require(msg.sender == project.creator, "Only creator can assign tasks");
        require(_taskId < project.totalTasks, "Invalid task ID");
        require(project.tasks[_taskId].status == TaskStatus.Open, "Task not available");

        project.tasks[_taskId].status = TaskStatus.Assigned;
        project.taskAssignee[_taskId] = _assignee;
        ds.userTasks[_assignee].push(_taskId);

        emit TaskAssigned(_projectId, _taskId, _assignee);
    }

    function completeTask(uint256 _projectId, uint256 _taskId) external {
        DiamondStorage storage ds = diamondStorage();
        Project storage project = ds.projects[_projectId];
        require(msg.sender == project.taskAssignee[_taskId], "Not task assignee");
        require(project.tasks[_taskId].status == TaskStatus.InProgress, "Task not in progress");

        project.tasks[_taskId].status = TaskStatus.Completed;
        emit TaskCompleted(_projectId, _taskId, msg.sender);
    }

    function verifyTask(uint256 _projectId, uint256 _taskId) external {
        DiamondStorage storage ds = diamondStorage();
        Project storage project = ds.projects[_projectId];
        require(msg.sender == project.creator, "Only creator can verify");
        require(project.tasks[_taskId].status == TaskStatus.Completed, "Task not completed");

        project.tasks[_taskId].status = TaskStatus.Verified;
        project.taskCompleted[_taskId] = true;

        // Transfer reward to assignee
        address assignee = project.taskAssignee[_taskId];
        uint256 reward = project.tasks[_taskId].reward;
        IERC20(ds.usdtToken).transfer(assignee, reward);

        emit TaskVerified(_projectId, _taskId, msg.sender);
    }

    // View functions
    function getProject(uint256 _projectId) external view returns (
        address creator,
        string memory title,
        string memory description,
        uint256 fundingGoal,
        uint256 raisedAmount,
        uint256 startTime,
        uint256 endTime,
        bool isFunded,
        ProjectStatus status,
        uint256 totalTasks
    ) {
        DiamondStorage storage ds = diamondStorage();
        Project storage project = ds.projects[_projectId];
        return (
            project.creator,
            project.title,
            project.description,
            project.fundingGoal,
            project.raisedAmount,
            project.startTime,
            project.endTime,
            project.isFunded,
            project.status,
            project.totalTasks
        );
    }

    function getTask(uint256 _projectId, uint256 _taskId) external view returns (
        string memory title,
        string memory description,
        uint256 reward,
        uint256 deadline,
        TaskStatus status,
        string[] memory requiredSkills,
        uint256 estimatedHours,
        address assignee
    ) {
        DiamondStorage storage ds = diamondStorage();
        Project storage project = ds.projects[_projectId];
        Task storage task = project.tasks[_taskId];
        return (
            task.title,
            task.description,
            task.reward,
            task.deadline,
            task.status,
            task.requiredSkills,
            task.estimatedHours,
            project.taskAssignee[_taskId]
        );
    }

    function getUserProjects(address _user) external view returns (uint256[] memory) {
        DiamondStorage storage ds = diamondStorage();
        return ds.userProjects[_user];
    }

    function getUserTasks(address _user) external view returns (uint256[] memory) {
        DiamondStorage storage ds = diamondStorage();
        return ds.userTasks[_user];
    }

    function getContribution(uint256 _projectId, address _contributor) external view returns (uint256) {
        DiamondStorage storage ds = diamondStorage();
        return ds.projects[_projectId].contributions[_contributor];
    }
}