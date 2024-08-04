---
layout: post
title: "Postgres: Checking Queries in Real Time"
---
Recently I came around a really simple way of checking what queries are going on in Postgres at any given time. Basically what you want to do is tell Postgres to log all queries and then you can tail the log file.

The first step is to tell Postgres to log all queries. To do that you go to your postgresql.conf file (mine’s here: ~/Library/Application Support/Postgres/var-9.4) and set the following options:

	logging_collector = on
	log_directory = ‘pg_log’
	log_statement = ‘all’

Once you’ve configured these values Postgres will be dumping all queries into the current log file at pg_log. Now you can tail your log file and see what queries are happening in real time.

	# Change this to your log’s folder.

	tail -f ~/Library/Application\ Support/Postgres/var-9.4/pg_log/*

Also, it’s worth noting that Pg Admin has a log viewer you can use for this task. Just go to Tools > Server Status and you should get this window:

![Screenshot of PG Admin Log](/files/2015-06-10-postgres-checking-queries/pg_admin.png)
