window.SupportOpenView = Backbone.View.extend({
  events: {
    'click .openticket': 'newticketmodal',
    'click .btn_send_ticket': 'sendticket',
    'click tbody tr': 'getticket'
  },
  getticket: function(evt) {
    app.navigate('/support/'+$(evt.target).parent().attr('data-id'), {
      trigger: true
    });
  },
  sendticket: function() {
    var message = {
      email: this.model.get('username'),
      date: new Date().getTime(),
      message: $("#input_content").val()
    };
    var data = {
      message: [message],
      subject: $("#input_subject").val()
    };
    console.log(data);
    modem('POST', 'support',
      function(json) {
        var smsg = ['Ticket created', 'Ticket criado', 'Ticket creado'];
        showSuccess(smsg[getlang()]);
        app.navigate('/support/'+json.id, {
          trigger: true
        });
        console.log(json);
      },
      function(xhr, ajaxOptions, thrownError) {
        var json = JSON.parse(xhr.responseText);
        var emsg = ['Failed to create ticket', 'Falha ao criar ticket', 'Error al crear ticket'];
        showError(emsg[getlang()]+'<br>'+json.error);
      }, data
    );
  },
  newticketmodal: function() {
    $('#modal_new_ticket').on('shown', function() {});
    $('#modal_new_ticket').modal({});
  },
  gettickets: function() {
    var self = this;
    var handler = function(tabela, json) {
      var oTable = $(tabela, self.el).dataTable({
        "data": json,
        "bAutoWidth": false ,
        "columns": [
          {"data": "owner", "sWidth": "25%",},
          {"data": "subject", "sWidth": "30%",},
          {"data": null,
            "sWidth": "30%",
            "bSortable": true,
            "mRender": function(data, type, full) {
              var last = new Date(parseInt(full.messages[full.messages.length-1].date));
              return formatdate(last);
            }},
          {"data": "status", "sWidth": "15%",},
        ],
        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
            $(nRow).attr('data-id',aData._id);
            return nRow;
        }
      });
    };
    modem('GET', 'support',
      function(json) {
        var open = [];
        var closed = [];
        for (var i = 0; i < json.length; i++) {
          if (json[i].status !== 'Closed') {
            open.push(json[i]);
          }
        }
        $('.badge').html(open.length);
        handler('#opentickets',open);
      },
      function(xhr, ajaxOptions, thrownError) {
        var json = JSON.parse(xhr.responseText);
        var emsg = ['Failed to get tickets', 'Falha ao carregar tickets', 'Error al cargar tickets'];
        showError(emsg[getlang()]+'<br>'+json.error);
      }
    );
  },
  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));
    $('#gotohome').removeClass('active');
    $('#gotosupport').addClass('active');
    $('.ticketcontent', this.el).wysihtml5({
      "font-styles": false,
      "image": false,
      "indent": false,
      "outdent": false
    });
    $('.support-open', this.el).i18n();

    $('.supportmenu li').removeClass('active');
    $('#gotoopen').parent().addClass('active');

    this.gettickets();
    return this;
  }

});
