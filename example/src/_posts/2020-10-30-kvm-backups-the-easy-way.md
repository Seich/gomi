---
layout: post
title: "KVM Backups, the easy way"
---

I am now using a dedicated server to host all of my various projects. It turns
out if you are willing to do a lot of the work yourself you can get quite a bit
for you buck. Since I have to take care of backups myself now I had to rethink
my general backup strategy.

In the name of being as lazy as possible what I've been doing now is using
libvirt to create individual VMs for every project. To back them up I can just
copy off the entire disk somewhere else. Once compressed these are relatively
small for what they are and are easy to move around into storage.

I am also using git underneath almost everything so that actual code and assets
are also backed up locally and on github/gitea etc.

Anyways, here's what I am using to back machines up:

```sh
DOMAIN="$1"

DISK="$(virsh domblklist $DOMAIN | tail -n +3 | awk '{print $2}' | tr -d '\n')";
TIME=$(date "+%Y-%m-%d--%H.%M.%S");

virsh snapshot-create-as --domain $DOMAIN "$DOMAIN-backup" \
        --diskspec vda,file=/var/lib/libvirt/images/$DOMAIN-backup.qcow2 \
        --disk-only --atomic --quiesce --no-metadata;

xz -k --verbose /var/lib/libvirt/images/$DOMAIN.qcow2;

curl --netrc -T /var/lib/libvirt/images/$DOMAIN.qcow2.xz ftp://ftp.example.org/$DOMAIN.$TIME.qcow2.xz;

virsh blockcommit $DOMAIN vda --active --verbose --pivot;
rm /var/lib/libvirt/images/$DOMAIN.qcow2.xz;
rm /var/lib/libvirt/images/$DOMAIN-backup.qcow2;
```

First I create a snapshot for the current machine I'll be backing up, these
machines are running the qemu agent so I get to use `--quiesce` to freeze the
file system. If you don't have the agent installed you'd probably have to make
some small changes to the command.

```sh
virsh snapshot-create-as --domain $DOMAIN "$DOMAIN-backup" \
        --diskspec vda,file=/var/lib/libvirt/images/$DOMAIN-backup.qcow2 \
        --disk-only --atomic --quiesce --no-metadata;
```

Once that's done I'll compress it using `xz`. This will make the backup tiny but
it takes a really long time, you could use zip, tar or nothing at all if you
want the whole process to be faster.

```sh
xz -k --verbose /var/lib/libvirt/images/$DOMAIN.qcow2;
```

Now we can upload the compressed file to our backup location. I use curl to
upload to a local network drive I have available. I also attach a timestamp to
the file name as I do this.

```sh
curl --netrc -T /var/lib/libvirt/images/$DOMAIN.qcow2.xz ftp://ftp.example.org/$DOMAIN.$TIME.qcow2.xz;
```

Finally I will use blockcommit to pivot back to the original disk image, merging
the contents of the backup and anything that's happened since the snapshot was
taken, and remove the unnecessary snapshot and compressed files.

```sh
virsh blockcommit $DOMAIN vda --active --verbose --pivot;
rm /var/lib/libvirt/images/$DOMAIN.qcow2.xz;
rm /var/lib/libvirt/images/$DOMAIN-backup.qcow2;
```

It took me a bit to figure out how to do this which is why I am documenting it
here for myself. Most of this is based of off [this wiki
entry](https://wiki.libvirt.org/page/Live-disk-backup-with-active-blockcommit).
