-- This script runs once when the PostgreSQL container is first created.
-- It creates the two databases needed by the Blue Orbit microservices.

CREATE DATABASE orbital_db;
CREATE DATABASE mission_db;
