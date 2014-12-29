module.exports = {
	'column value':'SELECT `user`.`first_name`, `user`.`last_name`, `user`.`emailAddress`, `user`.`title`, `user`.`phone`, `user`.`type`, `user`.`favoriteFruit`, `user`.`age`, `user`.`dob`, `user`.`status`, `user`.`percent`, `user`.`arrList`, `user`.`obj`, `user`.`id`, `user`.`createdAt`, `user`.`updatedAt` FROM `userTable` AS `user`  WHERE LOWER(`user`.`type`) = "column value" '
};
