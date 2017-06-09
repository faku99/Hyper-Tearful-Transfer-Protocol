const Docker = require('dockerode');
const express = require('express');

var docker = new Docker({ socketPath: '/var/run/docker.sock' });
var router = express();

router.get('/images/list', function(req, res) {
    docker.listImages(function(err, images) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json(images);
    });
});

router.get('/containers/list', function(req, res) {
    docker.listContainers({
        all: true
    }, function(err, containers) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json(containers);
    });
});

router.post('/containers/create', function(req, res) {
    docker.createContainer({
        Image: req.body.Image
    }, function(err, container) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json(container);
    });
});

router.post('/containers/killall', function(req, res) {
    docker.listContainers({
        all: true
    }, function(err, containers) {
        if (err) {
            return res.status(500).json(err);
        }

        containers.forEach(function(containerInfo) {
            docker.getContainer(containerInfo.Id).kill();
        });

        return res.status(200).json('Success');
    });
});

router.post('/containers/:id/kill', function(req, res) {
    var container = docker.getContainer(req.params.id);

    container.kill(function(err, data) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json('Success');
    });
});

router.post('/containers/:id/start', function(req, res) {
    var container = docker.getContainer(req.params.id);

    container.start(function(err, data) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json('Success');
    });
});

router.delete('/containers', function(req, res) {
    docker.listContainers({
        all: true
    }, function(err, containers) {
        if (err) {
            return res.status(500).json(err);
        }

        containers.forEach(function(containerInfo) {
            docker.getContainer(containerInfo.Id).remove();
        });

        res.status(200).json('Success');
    });
});

router.delete('/containers/:id', function(req, res) {
    var container = docker.getContainer(req.params.id);

    container.remove(function(err, data) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(200).json('Success');
    });
});

module.exports = router;
