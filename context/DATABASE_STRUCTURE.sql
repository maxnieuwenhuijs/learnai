-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 209.38.40.156    Database: db
-- ------------------------------------------------------
-- Server version	8.4.6-0ubuntu0.25.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'low',
  `description` text,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id` (`user_id`),
  KEY `audit_logs_company_id` (`company_id`),
  KEY `audit_logs_action` (`action`),
  KEY `audit_logs_entity_type_entity_id` (`entity_type`,`entity_id`),
  KEY `audit_logs_created_at` (`created_at`),
  KEY `audit_logs_severity` (`severity`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `audit_logs_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `calendar_events`
--

DROP TABLE IF EXISTS `calendar_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL COMMENT 'User this event belongs to',
  `course_id` int DEFAULT NULL COMMENT 'Related course if applicable',
  `company_id` int DEFAULT NULL COMMENT 'Company-wide events',
  `department_id` int DEFAULT NULL COMMENT 'Department-specific events',
  `title` varchar(255) NOT NULL,
  `description` text,
  `event_type` enum('deadline','meeting','exam','training','webinar','holiday','other') NOT NULL DEFAULT 'other',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `all_day` tinyint(1) NOT NULL DEFAULT '0',
  `location` varchar(500) DEFAULT NULL COMMENT 'Physical location or meeting link',
  `is_online` tinyint(1) NOT NULL DEFAULT '0',
  `meeting_url` varchar(500) DEFAULT NULL COMMENT 'Virtual meeting URL',
  `color` varchar(7) DEFAULT '#3b82f6' COMMENT 'Event color in hex format',
  `reminder_minutes` int DEFAULT NULL COMMENT 'Minutes before event to send reminder',
  `recurring` tinyint(1) NOT NULL DEFAULT '0',
  `recurrence_pattern` json DEFAULT NULL COMMENT 'Recurrence rules (daily, weekly, monthly, etc.)',
  `attendees` json DEFAULT NULL COMMENT 'List of attendee user IDs',
  `created_by` int NOT NULL,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `calendar_events_user_id_start_date` (`user_id`,`start_date`),
  KEY `calendar_events_course_id` (`course_id`),
  KEY `calendar_events_company_id_department_id` (`company_id`,`department_id`),
  KEY `calendar_events_event_type` (`event_type`),
  KEY `calendar_events_start_date_end_date` (`start_date`,`end_date`),
  KEY `department_id` (`department_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `calendar_events_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `calendar_events_ibfk_6` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `calendar_events_ibfk_7` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `calendar_events_ibfk_8` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `calendar_events_ibfk_9` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `certificate_uid` varchar(255) NOT NULL,
  `verification_code` varchar(255) DEFAULT NULL,
  `issued_at` datetime NOT NULL,
  `valid_until` datetime DEFAULT NULL,
  `status` enum('active','revoked','expired') NOT NULL DEFAULT 'active',
  `settings` json DEFAULT NULL,
  `final_score` float DEFAULT NULL,
  `completion_time` int DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificate_uid` (`certificate_uid`),
  UNIQUE KEY `certificate_uid_2` (`certificate_uid`),
  UNIQUE KEY `verification_code` (`verification_code`),
  KEY `user_id` (`user_id`),
  KEY `course_id` (`course_id`),
  KEY `idx_certificates_verification_code` (`verification_code`),
  KEY `idx_certificates_status` (`status`),
  KEY `idx_certificates_issued_at` (`issued_at`),
  CONSTRAINT `certificates_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `certificates_ibfk_4` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `industry` varchar(255) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Netherlands',
  `size` varchar(50) DEFAULT NULL,
  `description` text,
  `status` enum('active','trial','inactive','suspended') NOT NULL DEFAULT 'trial',
  `subscription_type` enum('free','basic','premium','enterprise') NOT NULL DEFAULT 'free',
  `max_users` int DEFAULT '10',
  `logo_url` varchar(500) DEFAULT NULL COMMENT 'URL path to company logo file',
  `logo_filename` varchar(255) DEFAULT NULL COMMENT 'Original filename of the uploaded logo',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `unique_company_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `company_course_assignments`
--

DROP TABLE IF EXISTS `company_course_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_course_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `course_id` int NOT NULL,
  `assigned_by` int DEFAULT NULL,
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_company_course` (`company_id`,`course_id`),
  UNIQUE KEY `company_course_assignments_company_id_course_id` (`company_id`,`course_id`),
  KEY `course_id` (`course_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `company_course_assignments_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `company_course_assignments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `company_course_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `content_uploads`
--

DROP TABLE IF EXISTS `content_uploads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `content_uploads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int DEFAULT NULL COMMENT 'Associated course',
  `module_id` int DEFAULT NULL COMMENT 'Associated module',
  `lesson_id` int DEFAULT NULL COMMENT 'Associated lesson',
  `file_name` varchar(255) NOT NULL COMMENT 'Original file name',
  `file_path` varchar(500) NOT NULL COMMENT 'Storage path or URL',
  `file_type` varchar(50) NOT NULL COMMENT 'MIME type of the file',
  `file_extension` varchar(10) NOT NULL COMMENT 'File extension',
  `file_size` bigint NOT NULL COMMENT 'File size in bytes',
  `content_type` enum('video','document','presentation','image','audio','archive','other') NOT NULL DEFAULT 'other',
  `storage_type` enum('local','s3','azure','gcs','url') NOT NULL DEFAULT 'local' COMMENT 'Storage location type',
  `cdn_url` varchar(500) DEFAULT NULL COMMENT 'CDN URL if available',
  `thumbnail_url` varchar(500) DEFAULT NULL COMMENT 'Thumbnail for videos and images',
  `duration` int DEFAULT NULL COMMENT 'Duration in seconds (for videos/audio)',
  `resolution` varchar(20) DEFAULT NULL COMMENT 'Resolution for videos (e.g., 1920x1080)',
  `encoding` varchar(50) DEFAULT NULL COMMENT 'Video/audio encoding format',
  `pages` int DEFAULT NULL COMMENT 'Number of pages (for documents)',
  `transcription_url` text COMMENT 'URL to transcription file (for videos/audio)',
  `subtitles_url` text COMMENT 'URL to subtitles file (for videos)',
  `metadata` json DEFAULT NULL COMMENT 'Additional metadata (dimensions, bitrate, etc.)',
  `tags` json DEFAULT NULL COMMENT 'Tags for categorization and search',
  `description` text COMMENT 'Description of the content',
  `uploaded_by` int NOT NULL,
  `access_level` enum('public','registered','enrolled','restricted') NOT NULL DEFAULT 'enrolled' COMMENT 'Who can access this content',
  `download_count` int NOT NULL DEFAULT '0',
  `view_count` int NOT NULL DEFAULT '0',
  `processing_status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'completed' COMMENT 'Processing status for video transcoding, etc.',
  `processing_error` text COMMENT 'Error message if processing failed',
  `checksum` varchar(64) DEFAULT NULL COMMENT 'File checksum for integrity verification',
  `virus_scan_status` enum('pending','clean','infected','error') NOT NULL DEFAULT 'pending' COMMENT 'Virus scan status',
  `virus_scan_date` datetime DEFAULT NULL,
  `expiry_date` datetime DEFAULT NULL COMMENT 'When this content expires and should be removed',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `content_uploads_checksum` (`checksum`),
  KEY `content_uploads_course_id` (`course_id`),
  KEY `content_uploads_module_id` (`module_id`),
  KEY `content_uploads_lesson_id` (`lesson_id`),
  KEY `content_uploads_uploaded_by` (`uploaded_by`),
  KEY `content_uploads_content_type` (`content_type`),
  KEY `content_uploads_file_type` (`file_type`),
  KEY `content_uploads_is_active_access_level` (`is_active`,`access_level`),
  CONSTRAINT `content_uploads_ibfk_5` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `content_uploads_ibfk_6` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `content_uploads_ibfk_7` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `content_uploads_ibfk_8` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_assignments`
--

DROP TABLE IF EXISTS `course_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `company_id` int NOT NULL,
  `department_id` int DEFAULT NULL,
  `assigned_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `company_id` (`company_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `course_assignments_ibfk_4` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `course_assignments_ibfk_5` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `course_assignments_ibfk_6` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_modules`
--

DROP TABLE IF EXISTS `course_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_modules` (
  `course_id` int NOT NULL,
  `module_id` int NOT NULL,
  `module_order` int NOT NULL,
  PRIMARY KEY (`course_id`,`module_id`),
  UNIQUE KEY `course_modules_module_id_course_id_unique` (`course_id`,`module_id`),
  KEY `module_id` (`module_id`),
  CONSTRAINT `course_modules_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `course_modules_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) DEFAULT 'general',
  `difficulty` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  `duration_hours` float DEFAULT '1',
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `target_role` varchar(100) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `certificate_settings` json DEFAULT NULL COMMENT 'JSON data containing certificate configuration settings for this course',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_global` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `courses_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `courses_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `module_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content_type` enum('video','text','quiz','lab_simulation') NOT NULL,
  `content_data` json DEFAULT NULL,
  `lesson_order` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `module_id` (`module_id`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `estimated_duration_minutes` int DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('system','course_update','deadline','assignment','achievement','announcement') NOT NULL DEFAULT 'system',
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `action_url` varchar(500) DEFAULT NULL COMMENT 'URL to navigate when notification is clicked',
  `metadata` json DEFAULT NULL COMMENT 'Additional data for the notification',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_read` (`user_id`,`read`),
  KEY `notifications_created_at` (`created_at`),
  KEY `notifications_type` (`type`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prompt_approvals`
--

DROP TABLE IF EXISTS `prompt_approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prompt_approvals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prompt_id` int NOT NULL,
  `version_id` int DEFAULT NULL,
  `requested_by` int NOT NULL,
  `reviewer_id` int DEFAULT NULL,
  `status` enum('pending','approved','rejected','changes_requested') DEFAULT 'pending',
  `request_type` enum('new_prompt','version_update','status_change','deletion') NOT NULL,
  `comments` text,
  `reviewer_comments` text,
  `requested_at` datetime DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  PRIMARY KEY (`id`),
  KEY `prompt_approvals_prompt_id` (`prompt_id`),
  KEY `prompt_approvals_requested_by` (`requested_by`),
  KEY `prompt_approvals_reviewer_id` (`reviewer_id`),
  KEY `prompt_approvals_status` (`status`),
  KEY `prompt_approvals_request_type` (`request_type`),
  KEY `prompt_approvals_requested_at` (`requested_at`),
  KEY `version_id` (`version_id`),
  CONSTRAINT `prompt_approvals_ibfk_5` FOREIGN KEY (`prompt_id`) REFERENCES `prompts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prompt_approvals_ibfk_6` FOREIGN KEY (`version_id`) REFERENCES `prompt_versions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `prompt_approvals_ibfk_7` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prompt_approvals_ibfk_8` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prompt_categories`
--

DROP TABLE IF EXISTS `prompt_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prompt_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `color` varchar(7) DEFAULT '#6366f1',
  `icon` varchar(50) DEFAULT 'MessageSquare',
  `is_active` tinyint(1) DEFAULT '1',
  `company_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  KEY `prompt_categories_company_id` (`company_id`),
  KEY `prompt_categories_name` (`name`),
  CONSTRAINT `prompt_categories_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prompt_usage`
--

DROP TABLE IF EXISTS `prompt_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prompt_usage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prompt_id` int NOT NULL,
  `user_id` int NOT NULL,
  `version_used` int NOT NULL,
  `variables_data` json DEFAULT NULL,
  `generated_content` text,
  `context` varchar(100) DEFAULT NULL,
  `used_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prompt_usage_prompt_id` (`prompt_id`),
  KEY `prompt_usage_user_id` (`user_id`),
  KEY `prompt_usage_used_at` (`used_at`),
  KEY `prompt_usage_context` (`context`),
  CONSTRAINT `prompt_usage_ibfk_3` FOREIGN KEY (`prompt_id`) REFERENCES `prompts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prompt_usage_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prompt_versions`
--

DROP TABLE IF EXISTS `prompt_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prompt_versions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prompt_id` int NOT NULL,
  `version_number` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `content` text NOT NULL,
  `variables` json DEFAULT NULL,
  `change_notes` text,
  `created_by` int NOT NULL,
  `status` enum('draft','pending_review','approved','rejected') DEFAULT 'draft',
  `is_current` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prompt_versions_prompt_id_version_number` (`prompt_id`,`version_number`),
  KEY `prompt_versions_prompt_id` (`prompt_id`),
  KEY `prompt_versions_version_number` (`version_number`),
  KEY `prompt_versions_status` (`status`),
  KEY `prompt_versions_is_current` (`is_current`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `prompt_versions_ibfk_3` FOREIGN KEY (`prompt_id`) REFERENCES `prompts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prompt_versions_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prompts`
--

DROP TABLE IF EXISTS `prompts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prompts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `content` text NOT NULL,
  `variables` json DEFAULT NULL,
  `category_id` int NOT NULL,
  `company_id` int NOT NULL,
  `department_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `version` int DEFAULT '1',
  `status` enum('draft','pending_review','approved','rejected','archived') DEFAULT 'draft',
  `is_template` tinyint(1) DEFAULT '0',
  `parent_id` int DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `usage_count` int DEFAULT '0',
  `last_used_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prompts_category_id` (`category_id`),
  KEY `prompts_company_id` (`company_id`),
  KEY `prompts_department_id` (`department_id`),
  KEY `prompts_created_by` (`created_by`),
  KEY `prompts_status` (`status`),
  KEY `prompts_is_template` (`is_template`),
  KEY `prompts_parent_id` (`parent_id`),
  CONSTRAINT `prompts_ibfk_10` FOREIGN KEY (`parent_id`) REFERENCES `prompts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `prompts_ibfk_6` FOREIGN KEY (`category_id`) REFERENCES `prompt_categories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prompts_ibfk_7` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prompts_ibfk_8` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `prompts_ibfk_9` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_schedules`
--

DROP TABLE IF EXISTS `report_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT 'User who created the schedule',
  `company_id` int DEFAULT NULL COMMENT 'Company scope for the report',
  `department_id` int DEFAULT NULL COMMENT 'Department scope for the report',
  `report_name` varchar(255) NOT NULL,
  `report_type` enum('compliance','progress','completion','engagement','team_performance','course_analytics','certificate_summary','custom') NOT NULL,
  `frequency` enum('daily','weekly','biweekly','monthly','quarterly','yearly','once') NOT NULL,
  `day_of_week` int DEFAULT NULL COMMENT '0 = Sunday, 6 = Saturday (for weekly reports)',
  `day_of_month` int DEFAULT NULL COMMENT 'Day of month for monthly reports',
  `time_of_day` time NOT NULL DEFAULT '09:00:00' COMMENT 'Time to generate the report',
  `recipients` json NOT NULL COMMENT 'Array of email addresses to send report to',
  `cc_recipients` json DEFAULT NULL COMMENT 'CC recipients for the report',
  `format` enum('pdf','excel','csv','html') NOT NULL DEFAULT 'pdf',
  `last_run` datetime DEFAULT NULL COMMENT 'Last time report was generated',
  `next_run` datetime DEFAULT NULL COMMENT 'Next scheduled run time',
  `config` json DEFAULT NULL COMMENT 'Report-specific configuration (filters, parameters, etc.)',
  `filters` json DEFAULT NULL COMMENT 'Filters to apply to report data',
  `include_charts` tinyint(1) NOT NULL DEFAULT '1',
  `include_summary` tinyint(1) NOT NULL DEFAULT '1',
  `language` varchar(5) NOT NULL DEFAULT 'en' COMMENT 'Language for report generation',
  `timezone` varchar(50) NOT NULL DEFAULT 'UTC' COMMENT 'Timezone for scheduling',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `failure_count` int NOT NULL DEFAULT '0' COMMENT 'Number of consecutive failures',
  `last_error` text COMMENT 'Last error message if generation failed',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_schedules_user_id` (`user_id`),
  KEY `report_schedules_next_run_is_active` (`next_run`,`is_active`),
  KEY `report_schedules_report_type` (`report_type`),
  KEY `report_schedules_company_id_department_id` (`company_id`,`department_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `report_schedules_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `report_schedules_ibfk_5` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `report_schedules_ibfk_6` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `system_metrics`
--

DROP TABLE IF EXISTS `system_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_metrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `metric_name` varchar(100) NOT NULL,
  `metric_value` decimal(10,4) NOT NULL,
  `metric_unit` varchar(20) DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'system',
  `metadata` json DEFAULT NULL,
  `recorded_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `system_metrics_metric_name` (`metric_name`),
  KEY `system_metrics_category` (`category`),
  KEY `system_metrics_recorded_at` (`recorded_at`),
  KEY `system_metrics_metric_name_recorded_at` (`metric_name`,`recorded_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4511 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_progress`
--

DROP TABLE IF EXISTS `user_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `time_spent_seconds` int DEFAULT '0',
  `quiz_score` decimal(5,2) DEFAULT NULL,
  `last_accessed_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_progress_user_id_lesson_id` (`user_id`,`lesson_id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `user_progress_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_progress_ibfk_4` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('participant','manager','admin','super_admin') NOT NULL DEFAULT 'participant',
  `oauth_provider` varchar(20) DEFAULT NULL,
  `oauth_id` varchar(255) DEFAULT NULL,
  `oauth_email` varchar(255) DEFAULT NULL,
  `profile_picture_url` text,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `users_oauth_provider_oauth_id` (`oauth_provider`,`oauth_id`),
  KEY `company_id` (`company_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `users_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `users_ibfk_4` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-17 12:32:09
