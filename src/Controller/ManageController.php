<?php
namespace Acl\Controller;

use Acl\Controller\AppController;
use Cake\ORM\TableRegistry;

class ManageController extends AppController
{
    public function index()
    {
        $users = TableRegistry::get('Users')->find('list');
        $groups = TableRegistry::get('Groups')->find('list');
        $this->set(compact("users","groups"));
    }
}
