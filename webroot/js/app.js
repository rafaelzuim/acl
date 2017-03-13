"use strict";
;(function (window, document, $) {
    /**
     * JS class to give a extra elements control in admin iugu section
     * @author Rafael Caparroz Zuim <rafael.czuim@gmail.com>
     * @company rZCode
     * @base Iugu
     */
    function AclControl() {
        /**
         * Bind some elements to upgrade the form experience
         */
        var reloadTableAjax = null;

        this.binds = function () {
            $("body").on("change", "#user-id", function (e) {
                e.preventDefault();
                $(".ajaxAclUsers tr td").remove();
                AclControl.reloadTableUsers($('#user-id').val());
            });

            $("body").on("change", "#group-id", function (e) {
                e.preventDefault();
                $(".ajaxAclGroups tr td").remove();
                AclControl.reloadTableGroups($('#group-id').val());
            });


            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                var self = this;
                if ($(this).attr('href') == "#users") {
                    self.reloadTableAjax = AclControl.reloadTableUsers($('#user-id').val());
                } else if ($(this).attr('href') == "#groups") {
                    self.reloadTableAjax = AclControl.reloadTableGroups($('#group-id').val());
                }
            });
            $("body").on("change", "input.active", function (e) {
                var active = $(this).prop('checked');
                var checkUser = "";
                var checkGroup = "";
                var tr = $(this).closest('tr');
                var controller = tr.find('td:first').html();
                var action = tr.find('td:nth-child(2)').html();
                var user_id = $('#user-id').val();
                var group_id = $('#group-id').val();
                if (active) {
                    if ($(this).closest('table').attr('id') == 'usersTable') {
                        checkUser = AclControl.grantPermissionUser(controller, action, $(this).val(), user_id);
                    }
                    else {
                        checkGroup = AclControl.grantPermissionGroup(controller, action, $(this).val(), group_id);
                    }
                } else {
                    if ($(this).closest('table').attr('id') == 'usersTable') {
                        checkUser = AclControl.denyPermissionUser(controller, action, $(this).val(), user_id);
                    }
                    else {
                        checkGroup = AclControl.denyPermissionGroup(controller, action, $(this).val(), $('#group-id').val());
                    }
                }
            })
        };

        this.reloadTableUsers = function (user_id) {
            var url_full = window.location.origin;
            var $table = $(".ajaxAclUsers");
            var self = this;
            $('.ajaxAclUsers tbody').html('<tr><td colspan="4"><h4 class="text-center">Carregando</h4></td></tr>');

            return $.ajax({
                type: 'POST',
                dataType: 'json',
                url: url_full + '/users/get-acl/'+user_id,
                success: function (response) {
                    if (response.success == true) {
                        delete response['success'];
                        var html = '';
                        $.each(response.controllers, function (controller, actions) {

                            if(isNaN(actions)) {
                                $.each(actions, function (key, value) {
                                    if (key != "id" && key != "value") {
                                        html +=
                                            "<tr>" +
                                            "<td>" + controller + "</td>" +
                                            "<td>" + key + "</td>" +
                                            "<td>" +
                                            "<input type='checkbox' class='active' name='active' "+ (value.value == true ? ' checked="checked "' : '')+" value='" + value.id + "' />" +
                                            "</td>" +
                                            "</tr>";
                                    }
                                });
                            }
                        });
                        $table.find('tbody').html(html);
                    }
                    else {
                        $(".ajaxAclUsers thead").remove();
                        $(".alert-return").html(
                            "<div class='alert alert-warning alert-dismissable fade in'>" +
                            "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                            "<strong>Erro:</strong> Não foi possível carregar as permissões do usuário. Tente novamente." +
                            "</div>"
                        );
                        $(".alert-return").fadeTo(3000, 500).slideUp(500, function () {
                            $(".alert-return").slideUp(500);
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    /** Sempre bom ter esta parte da chamada para olharmos no console os erros e em algumas situações exibir erros ao cliente **/
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            });
        }

        this.reloadTableGroups = function (group_id) {
            var url_full = window.location.origin;
            var $table = $(".ajaxAclGroups");
            var self = this;
            $('.ajaxAclGroups tbody').html('<tr><td colspan="4"><h4 class="text-center">Carregando</h4></td></tr>');

            return $.ajax({
                type: 'POST',
                dataType: 'json',
                url: url_full + '/groups/get-acl/'+group_id,
                success: function (response) {
                    if (response.success == true) {
                        delete response['success'];
                        var html = '';
                        $.each(response.controllers, function (controller, actions) {

                            if(isNaN(actions)) {
                                $.each(actions, function (key, value) {
                                    if (key != "id" && key != "value") {
                                        html +=
                                            "<tr>" +
                                            "<td>" + controller + "</td>" +
                                            "<td>" + key + "</td>" +
                                            "<td>" +
                                            "<input type='checkbox' class='active' name='active' "+ (value.value == true ? ' checked="checked "' : '')+" value='" + value.id + "' />" +
                                            "</td>" +
                                            "</tr>";
                                    }
                                });
                            }
                        });
                        $table.find('tbody').html(html);
                    }
                    else {
                        $(".ajaxAclGroups thead").remove();
                        $(".alert-return").html(
                            "<div class='alert alert-warning alert-dismissable fade in'>" +
                            "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                            "<strong>Erro:</strong> Não foi possível carregar as permissões do grupo. Tente novamente." +
                            "</div>"
                        );
                        $(".alert-return").fadeTo(3000, 500).slideUp(500, function () {
                            $(".alert-return").slideUp(500);
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    /** Sempre bom ter esta parte da chamada para olharmos no console os erros e em algumas situações exibir erros ao cliente **/
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            });
        }

        this.grantPermissionUser = function (controller, action, action_id,  user_id) {
            var url_full = window.location.origin;
            return $.ajax({
                type: 'POST',
                dataType: 'json',
                data: {'controller': controller, 'action': action, 'action_id' :action_id},
                url: url_full + '/users/grant-permission/' + user_id,
                success: function (response) {
                    if (response.success == true) {
                        $(".alert-return").html(
                            "<div class='alert alert-success alert-dismissable fade in'>" +
                            "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                            "Permissão ativada." +
                            "</div>"
                        );
                        $(".alert-return").fadeTo(3000, 500).slideUp(500, function () {
                            $(".alert-return").slideUp(500);
                        });
                    }
                    else {
                        $(".alert-return").html(
                            "<div class='alert alert-danger alert-dismissable fade in'>" +
                            "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                            "<strong>Erro:</strong> Não foi possível ativar a permissão. Tente novamente." +
                            "</div>"
                        );
                        $(".alert-return").fadeTo(3000, 500).slideUp(500, function () {
                            $(".alert-return").slideUp(500);
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    /** Sempre bom ter esta parte da chamada para olharmos no console os erros e em algumas situações exibir erros ao cliente **/
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            });
        }

        this.denyPermissionUser = function (controller, action, action_id, user_id) {
            var url_full = window.location.origin;
            return $.ajax({
                type: 'POST',
                dataType: 'json',
                data: {'controller': controller, 'action': action, 'action_id' :action_id},
                url: url_full + '/users/deny-permission/' + user_id,
                success: function (response) {
                    if (response.success == true) {
                        $(".alert-return").html(
                            "<div class='alert alert-warning alert-dismissable fade in'>" +
                            "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                            "Permissão desativada." +
                            "</div>"
                        );
                        $(".alert-return").fadeTo(3000, 500).slideUp(500, function () {
                            $(".alert-return").slideUp(500);
                        });
                    }
                    else {
                        $(".alert-return").html(
                            "<div class='alert alert-danger alert-dismissable fade in'>" +
                            "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                            "<strong>Erro:</strong> Não foi possível desativar a permissão. Tente novamente." +
                            "</div>"
                        );
                        $(".alert-return").fadeTo(3000, 500).slideUp(500, function () {
                            $(".alert-return").slideUp(500);
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    /** Sempre bom ter esta parte da chamada para olharmos no console os erros e em algumas situações exibir erros ao cliente **/
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            });
        }

        this.grantPermissionGroup = function (controller, action, action_id , group_id) {
            var url_full = window.location.origin;
            return $.ajax({
                type: 'POST',
                dataType: 'json',
                data: {'controller': controller, 'action': action, 'action_id' :action_id},
                url: url_full + '/groups/grant-permission/' + group_id,
                success: function (response) {
                    if (response.success == true) {
                        $(".alert-return").html(
                            "<div class='alert alert-success alert-dismissable fade in'>" +
                            "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                            "Permissão ativada." +
                            "</div>"
                        );
                        $(".alert-return").fadeTo(3000, 500).slideUp(500, function () {
                            $(".alert-return").slideUp(500);
                        });
                    }
                    else {
                        $(".alert-return").html(
                            "<div class='alert alert-danger alert-dismissable fade in'>" +
                            "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                            "<strong>Erro:</strong> Não foi possível ativar a permissão. Tente novamente." +
                            "</div>"
                        );
                        $(".alert-return").fadeTo(3000, 500).slideUp(500, function () {
                            $(".alert-return").slideUp(500);
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    /** Sempre bom ter esta parte da chamada para olharmos no console os erros e em algumas situações exibir erros ao cliente **/
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            });
        }

        this.denyPermissionGroup = function (controller, action, action_id , group_id) {
            var url_full = window.location.origin;
            return $.ajax({
                type: 'POST',
                dataType: 'json',
                data: {'controller': controller, 'action': action, 'action_id' :action_id},
                url: url_full + '/groups/deny-permission/' + group_id,
                success: function (response) {
                    if (response.success == true) {
                        $(".alert-return").html(
                            "<div class='alert alert-warning alert-dismissable fade in'>" +
                            "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                            "Permissão desativada." +
                            "</div>"
                        );
                        $(".alert-return").fadeTo(3000, 500).slideUp(500, function () {
                            $(".alert-return").slideUp(500);
                        });
                    }
                    else {
                        $(".alert-return").html(
                            "<div class='alert alert-danger alert-dismissable fade in'>" +
                            "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                            "<strong>Erro:</strong> Não foi possível desativar a permissão. Tente novamente." +
                            "</div>"
                        );
                        $(".alert-return").fadeTo(3000, 500).slideUp(500, function () {
                            $(".alert-return").slideUp(500);
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    /** Sempre bom ter esta parte da chamada para olharmos no console os erros e em algumas situações exibir erros ao cliente **/
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            });
        }

        this.init = function(){

            var reloadTableUsers = AclControl.reloadTableUsers($('#user-id').val());

        }

        /**
         * Reset all binds
         */
        this.unbindAll = function () {
            $("body").off("change", "#user_id");
            $("body").off("change", "#group_id");
        }
    }

    // Initializes the class
    $(document).ready(
        function () {
            window.AclControl = AclControl = new AclControl();
            AclControl.init();
            AclControl.unbindAll();
            AclControl.binds();
        }
    )
})(window, document, jQuery);