<?php
use Cake\Routing\Route\DashedRoute;
use Cake\Routing\Router;

Router::plugin(
    'Acl',
    ['path' => '/acl'],
    function ($routes) {
        $routes->fallbacks(DashedRoute::class);
    }
);