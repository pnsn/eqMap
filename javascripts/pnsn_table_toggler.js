//dynamically toggle between units for table columns
$(function(){
  $('.toggle-links a').click(function(){
    $this = $(this);
    $this.hide();
    $("table.table-toggler thead th span[rev=" +  $this.attr('rev') + "]").hide();
    $("table.table-toggler thead th span[rev=" +  $this.attr('rel') + "]").show();
    var data = "data-" + $this.attr('rel');
    $(".toggle-links a[rev=" + $this.attr('rel') + "]").show();
    $("table.table-toggler tbody td[" + data + "]").html(function(){
      return $(this).attr(data);
    });
    return false;
  });
});