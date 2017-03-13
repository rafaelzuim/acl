<?php
namespace  Acl\Controller;

use App\Controller\AppController as BaseController;
use Cake\Event\Event;

class AppController extends BaseController
{
    public $css_for_layout=[];
    public $js_for_layout=[];

    public function initialize()
    {
        // include all necessary assets
        $this->css_for_layout = ["Acl.bootstrap.min"];
        $this->js_for_layout = ["Acl.jquery","Acl.app"];
    }

    public function beforeRender(Event $event)
    {
        if (!array_key_exists('_serialize', $this->viewVars) &&
            in_array($this->response->type(), ['application/json', 'application/xml'])
        ) {
            $this->set('_serialize', true);
        }
        // Adiciona todo o js a variável que será passada ao layout
        $this->set('front_js', $this->js_for_layout);
        // Adiciona todo o css a variável que será passada ao layout
        $this->set('front_css', $this->css_for_layout);
    }


}