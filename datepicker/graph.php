<div class="clearfix">

 <!-- <div class="rdp distxts pull-right" id= "date_selector" style="width: 238px; transform: translateY(-79px); position: relative; z-index: 10000;"> -->

    <div class="rdp distxts pull-right" id= "date_selector" style="width: 238px; transform: translateY(-10px);">
      <span class="from_date"><?php echo $date_range['from_text']?></span> - <span class="to_date"><?php echo $date_range['to_text']?></span>
      <span><span class="caret"></span></span>
    </div>
    <!-- </div> -->
</div>

<div class="calendar-wrapper clearfix">
  <div class="calendar-header">
    <div class="calendar-header-output calendar-header_start">Aug 17, 2025</div>
    <span></span>
    <div class="calendar-header-output calendar-header_end">Aug 23, 2025</div>
  </div>
  <div id="analytics_date_range"></div>
  <div class="range-footer clearfix">
    <a id="apply_date_range" href="#" class="btn btn-blue pull-right">Apply</a>
    <a id="cancel_date_range" href="#" class="btn btn-link pull-right">Cancel</a>
  </div>
</div>
<div id="graph_container" style="position:relative;"></div>

<script>
$( document ).ready(function() {

  // related to Tooltip of anlytic boxes , Video COmpletion and CTA
  $(".analtctooltip").tooltip();
  // ===============================


  var show_full_dimension = "<?php echo ($bucket_file_data['file_type']=='video' || $bucket_file_data['file_type']=='image' ? '0':'1') ?>";
  var calendar_props = {
      date_selector_el    : "#date_selector",
      from_date_label_el  : "#date_selector.from_date",
      to_date_label_el    : "#date_selector.to_date",
      apply_range_el      : "#apply_date_range",
      cancel_range_el     : "#cancel_date_range",
      calendar_el         : "#analytics_date_range",
      from_date           : "<?php echo $date_range['from'] ?>",
      to_date             : "<?php echo $date_range['to'] ?>",
  };
  var onRangeApply = function(from, to) {

    var from_date = $.datepicker.formatDate('yy-mm-dd', $.datepicker.parseDate($.datepicker._defaults.dateFormat, from));
    var to_date   = $.datepicker.formatDate('yy-mm-dd', $.datepicker.parseDate($.datepicker._defaults.dateFormat, to));

    var pathNames = $.address.pathNames();
    var path      = $.address.path();
    
    indexOfRange  = pathNames.indexOf('range');

    if( indexOfRange != -1 ) {
      path   = pathNames.slice(0, indexOfRange).join('/');
    }

    Jmp.App.changeAddress(path + '/range/' + from_date + '_' + to_date);
  }
  JSAnalyticsDateSelector(calendar_props, onRangeApply);

  var data = <?php echo $graph_data_json ?>;
  var props = {
    margin  : {top: 36, right: 9, bottom: 36, left: 46},
    width   : 768,
    height  : 246
  }
  JSAnalyticsGraph('#graph_container', props, data);
});
</script>