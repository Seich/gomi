---
layout: post
title: "Connecting To A Remote RethinkDB Admin Interface"
---

So here's a really quick tip, when you run a RethinkDB instance on a remote server you cannot access the admin interface, by default, from the outside of the server. The easiest way to get around this without allowing anyone to access it is to use a ssh tunnel like this:


	$ ssh -L 8080:localhost:8080 &lt;host&gt;

This basically uses ssh to map the port 8080 of your machine (127.0.0.1 or localhost) to the port 8080 on the host machine. Don't forget to replace "&lt;host&gt;" with your actual remote host.

With this, you can now connect to the admin interface by going to localhost:8080 on your machine. Note that this will only work as long as the ssh connection remains open.

## Additional Resources

* <a href="http://www.symantec.com/connect/articles/ssh-port-forwarding">SSH Port Forwarding - Symatec</a>
* <a href="https://help.ubuntu.com/community/SSH/OpenSSH/PortForwarding">SSH/OpenSSH/PortForwarding - Ubuntu Community Documentation</a>
