-- -----------------------------
-- Think MySQL Data Transfer 
-- 
-- Host     : 127.0.0.1
-- Port     : 3306
-- Database : lottery
-- 
-- Part : #1
-- Date : 2017-05-08 11:27:25
-- -----------------------------

SET FOREIGN_KEY_CHECKS = 0;


-- -----------------------------
-- Table structure for `gygy_collections`
-- -----------------------------
DROP TABLE IF EXISTS `gygy_collections`;
CREATE TABLE `gygy_collections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type_id` varchar(255) NOT NULL COMMENT '定制采种id',
  `uid` int(11) NOT NULL COMMENT '用户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`uid`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

