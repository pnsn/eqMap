//General application JS
$(function() {

  // The following sets the heights of certain elements
  // that require a fixed height. 
  $("#map-container").css({
    height: Math.round(.8 * $(window).height())
  });


  //Toggles an element when another element is clicked
  $(".toggler").click(function() {
    var target = $(this).attr("toggle");
    if ($(target).hasClass("toggleable")) {
      $(target).toggleClass("off");
    }
  });


  //Make a tooltip with: %a.tooltip-icon{rel:'whatever the rel is'}
  //I'm calling it a tooltip, buts its really a popover shhh
  $('.tooltip-icon').addClass("fa fa-info-circle").attr('data-toggle', 'popover');

  $('.tooltip-icon[data-toggle="popover"]').popover({
    html: true,
    trigger: 'click',
    title: function() {
      return $(".tooltip[rev=" + $(this).attr('rel') + "] .title").html()
    },
    content: function() {
      return $(".tooltip[rev=" + $(this).attr('rel') + "] .content").html()
    },
    placement: "auto"
  });

  //Make tool tips disappear when clicking away from them
  $('body, .modal').on('click', function(e) {
    $('[data-toggle="popover"]').each(function() {
      //the 'is' for buttons that trigger popups
      //the 'has' for icons within a button that triggers a popup
      if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
        $(this).popover('hide');
      }
    });
  });

  // Add loading spinner icon to instances of .loading
  $(".loading").addClass("center-block").append('<i class="fa fa-spinner fa-pulse fa-3x">');
  $(".loading.sm i").replaceWith('<i class="fa fa-spinner fa-pulse fa-2x">');

  //Returns value of param with given name from url (from stack overflow)
  $.urlParam = function(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
      return null;
    } else {
      return results[1] || 0;
    }
  };

  //Returns given url with the given param removed
  $.removeParam = function(param, url) {
    var loc = location.href.split("?");
    var href = "";
    if (loc.length > 1) {
      loc = $.grep(loc[1].split("&"), function(p, i) {
        return p.split("=")[0] != param;
      });

      $.each(loc, function(i, param) {
        if (i == 0) {
          href += "?"
        }
        if (i == loc.length - 1) {
          href += param;
        } else {
          href += param + "&";
        }
      });
    }
    return href;
  };

  //Auto refreshes a page every 5 minutes
  if ($.urlParam('auto_refresh')) {
    window.setInterval(function() {
      window.location = window.location;
    }, 300000);
  }
});