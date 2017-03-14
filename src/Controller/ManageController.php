<?php
namespace Acl\Controller;

use Acl\Controller\AppController;
use Cake\Datasource\ConnectionManager;
use Cake\ORM\TableRegistry;

class ManageController extends AppController
{
    private $acoAlias= 'Acos';
    private $acoClass= 'Acos';

    public function index()
    {
        $users = TableRegistry::get('Users')->find('list');
        $groups = TableRegistry::get('Groups')->find('list');
        $this->set(compact("users","groups"));
    }


    public function getUserAcl($user_id = null, $id = null){

        $this->loadModel("Acos");
        $this->loadModel("Aros");
        $this->loadModel("Users");

        $response = array("success"=>false,"msg"=>"");
        try{
            $conn = ConnectionManager::get('default');
            if($user_id != null) {
                $user = $this->Users->get($user_id, ['contain' => 'Groups']);

                if (isset($id)) {
                    $identity = $this->parseIdentifier($this->args[1]);

                    $topNode = $this->{$this->acoClass}->find('all', [
                        'conditions' => [$this->acoAlias . '.id' => $this->_getNodeId($this->acoClass, $identity)]
                    ])->first();

                    $nodes = $this->{$this->acoClass}->find('all', [
                        'conditions' => [
                            $this->acoAlias . '.lft >=' => $topNode->lft,
                            $this->acoAlias . '.lft <=' => $topNode->rght
                        ],
                        'order' => $this->acoAlias . '.lft ASC'
                    ]);
                } else {
                    $nodes = $this->{$this->acoClass}->find('all', ['order' => $this->acoAlias . '.lft ASC']);
                }

                if ($nodes->count() === 0) {
                    if (isset($id)) {
                        $this->error(__d('cake_acl', '{0} not found', [$id]), __d('cake_acl', 'No tree returned.'));
                    } elseif (isset($this->acoClass)) {
                        $this->error(__d('cake_acl', '{0} not found', [$this->acoClass]), __d('cake_acl', 'No tree returned.'));
                    }
                }

                $stack = [];
                $last = null;

                $rows = $nodes->hydrate(false)->toArray();

                $noh = "";
                $controller = "";
                $user_group_id = $conn->execute("SELECT id FROM aros where `foreign_key` = ". $user->id);
                $user_group_id = $user_group_id->fetch('assoc');

                foreach ($rows as $n) {
                    $stack[] = $n;
                    if (!empty($last)) {
                        $end = end($stack);
                        if ($end['rght'] > $last) {
                            foreach ($stack as $k => $v) {
                                $end = end($stack);
                                if ($v['rght'] < $end['rght']) {
                                    unset($stack[$k]);
                                }
                            }
                        }
                    }

                    $last = $n['rght'];
                    $count = count($stack);
                    switch ($count){
                        case 1:{
                            $response[$n['alias']] = ["id" =>  $n['id'] , "value" => $this->Acl->check($user_group_id['id'], $n['id'])];
                            $noh = $n['alias'];
                            break;
                        };
                        case 2:{
                            $controller = $n['alias'];
                            $response[$noh][$controller] = ["id" =>  $n['id'] , "value" => $this->Acl->check($user_group_id['id'], $n['id'])];
                            break;
                        };
                        case 3:{
                            $action = $n['alias'];
                            $response[$noh][$controller][$action] = ["id" =>  $n['id'] , "value" => $this->Acl->check($user_group_id['id'], $n['id'])];
                            break;
                        }
                    }
                }
            }
            $response['success'] = true;

        }catch(\Exception $e){
            $response["msg"] = $e->getMessage();
        }
        echo json_encode($response);
        die();
    }


    public function grantPermission($user_id = null){
        $response = array("success"=>false,"msg"=>"");
        try{
            $data = $this->request->data;
            $response['success'] = true;
            $conn = ConnectionManager::get('default');
            $response["user"] = "";
            if($user_id != null) {
                $user = $this->Users->get($user_id, ['contain' => 'Groups']);

                $response['success'] = true;
                $user_group_id = $conn->execute("SELECT id FROM aros where `foreign_key` = ". $user->id);
                $user_group_id = $user_group_id->fetch('assoc');
                $response['aco'] = $this->Acl->allow($user_group_id['id'], $data['action_id']);
            }

        }catch(\Exception $e){
            $response["msg"] = $e->getMessage();
        }
        echo json_encode($response);
        die();
    }

    public function denyPermission($user_id = null){

        $response = array("success"=>false,"msg"=>"");
        try{
            $data = $this->request->data;
            $conn = ConnectionManager::get('default');
            $response["user"] = "";
            if($user_id != null) {
                $user = $this->Users->get($user_id, ['contain' => 'Groups']);

                $response['success'] = true;
                $user_group_id = $conn->execute("SELECT id FROM aros where `foreign_key` = ". $user->id);
                $user_group_id = $user_group_id->fetch('assoc');
                $response['aco'] = $this->Acl->deny($user_group_id['id'], $data['action_id']);
            }

        }catch(\Exception $e){
            $response["msg"] = $e->getMessage();
        }
        echo json_encode($response);
        die();
    }
}
