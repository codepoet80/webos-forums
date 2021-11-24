/* Copyright 2009 Palm, Inc.  All rights reserved. */

Object.extend(Date.prototype,{

  getDayAsText: function() { 
    switch (this.getDay()) {
      case 0:
        return $L("Sun");
        break;
      case 1:
        return $L("Mon");
        break;
      case 2:
        return $L("Tue");
        break;
      case 3:
        return $L("Wed");
        break;
      case 4:
        return $L("Thu");
        break;
      case 5:
        return $L("Fri");
        break;
      case 6:
        return $L("Sat");
        break;
    }                              
    return null;
  },
  
  getMonthAsText: function(){
    switch(this.getMonth()) {
      case 0:
          return $L("Jan");
        break;
      case 1:
          return $L("Feb");
        break;
      case 2:
          return $L("Mar");
        break;
      case 3:
          return $L("Apr");
        break;
      case 4:
          return $L("May");
        break;
      case 5:
          return $L("Jun");
        break;
      case 6:
          return $L("Jul");
        break;
      case 7:
          return $L("Aug");
        break;
      case 8:
          return $L("Sep");
        break;
      case 9:
          return $L("Oct");
        break;
      case 10:
          return $L("Nov");
        break;
      case 11:
          return $L("Dec");
        break;                                                                                                    
    }
    return null;
  },

  getYearAsText: function(){
    return (this.getYear() + 1900);
  },
  
  subtract: function(d){
    return (this.getTime() - this.parseDate(d).getTime());    
  },
  
  isAfter: function(d) {
    var date = this.parseDate(d);
    
    if (date != null)
      return this.getTime() > date.getTime();
    else
      return false;
      
  },
  isBefore: function(d) {
    var date = this.parseDate(d);
    if(date != null)    
      return this.getTime() < date.getTime();
    else
      return false;
  },  
  isEqual: function(d) {
    var date = this.parseDate(d);
    if(date != null)
      return this.getTime() == date.getTime();
    else
      return false;
  },
  
  /**
   * 
   * @param {Object} d - either a Date object or a date in milliseconds
   */

  parseDate: function(d) {
    if (d instanceof Date) {
      return d;
    }
    else if (Object.isNumber(d)) {
      var tmp = new Date();
      tmp.setTime(d);
      return tmp;
    }
    else { // invalid date
    	return null;
    }
  },
  
  wipeTime: function() {
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
  }

});


var BucketDateFormatter = {
	CONST: {
	    TODAY : $L("Today"),
	    YESTERDAY : $L("Yesterday"),
	    LAST_WEEK : $L("Last week"),
	    TWO_WEEKS_AGO : $L("2 weeks ago"),
	    THREE_WEEKS_AGO : $L("3 weeks ago"),
	    TOMORROW : $L("Tomorrow"),
	    NEXT_WEEK : $L("Next week"),
	    TWO_WEEKS_FROM_NOW : $L("2 weeks from now"),
	    THREE_WEEKS_FROM_NOW : $L("3 weeks from now"),
	    DAYS_PER_WEEK : 7, 
	    DAY_IN_MS : 1000*60*60*24
	},
	
	createNewDateWithClearedTime: function(d) {
		var newDate = new Date();
		newDate.setTime(d.getTime());
		newDate.wipeTime();
		return newDate;
	},
	
	/**
	 * Given a timestamp in UTC, this method returns the "bucket" which that date falls into:
	 * 
	 * Buckets are similar to Outlook:
	 * Present: Today 
	 * Past: Yesterday, Day of Week: {Sat - Sun}, Last Week, 2 Weeks Ago, 3 Weeks Ago, 
	 * Month/Year.
	 * Future: Tomorrow, Day of Week: {Sat - Sun}, Next Week, 2 Weeks From Now, 
	 * 3 Weeks From Now, Month/Year
	 * 
	 * @param utcTimestamp
	 * @param appendTime - boolean - true: append the time to date buckets where it makes sense
	 * @param showTodayTimeOnly - boolean - true: when "Today" is encountered, only show the time
	 * @return
	 */
  
	getDateBucket: function(utcTimestamp,shouldAppendTime,showTodayTimeOnly) {
		var currentDay = this.createNewDateWithClearedTime(new Date());
		var localDate = this.createNewDateWithClearedTime(utcTimestamp);
		var appendTime = '';
		if(shouldAppendTime) {  
			appendTime = Mojo.Format.formatDate(utcTimestamp,{time: 'short'});
		}
		
		return this.getDateBucketFromInstant(localDate, currentDay, appendTime, showTodayTimeOnly);
	},
	
	getDateBucketFromInstant: function(localDate, referencePointDate, appendTime, showTodayTimeOnly) {
		var result = '';

		var differenceInDays =  Math.floor((referencePointDate.subtract(localDate))/(this.CONST.DAY_IN_MS));
		var differenceInDayOfMonth = Math.abs(referencePointDate.getDate() - localDate.getDate());

		if(differenceInDays == 0 && differenceInDayOfMonth == 0) {
			if (showTodayTimeOnly) {
				result = appendTime;
			} else {
				result = new Template($L("#{today} #{time}")).evaluate({today:this.CONST.TODAY,time:appendTime});
			}

		} else if(differenceInDays > 0 || (differenceInDays == 0 && differenceInDayOfMonth > 0)){
			//the utcTimestamp is in the past
			if(differenceInDays == 1 || (differenceInDays == 0 && differenceInDayOfMonth > 0)) {
				result = new Template($L("#{yesterday} #{time}")).evaluate({yesterday:this.CONST.YESTERDAY,time:appendTime});
			} else {
				// getDay() 0 to 6 == Sunday to Saturday
				var days = referencePointDate.getDay();

				//get the week boundaries - these represent the end of the given week - so lastWeek means
				//that everything before this time was last week.
				var lastWeek = referencePointDate.getTime() - (days*this.CONST.DAY_IN_MS);
				var twoWeeksAgo = referencePointDate.getTime() - ((days + this.CONST.DAYS_PER_WEEK)*this.CONST.DAY_IN_MS);
				var threeWeeksAgo = referencePointDate.getTime() - ((days + (2*this.CONST.DAYS_PER_WEEK))*this.CONST.DAY_IN_MS);
				var oneMonthAgo = referencePointDate.getTime() - ((days + (3*this.CONST.DAYS_PER_WEEK))*this.CONST.DAY_IN_MS);

				//if the localDate is after lastWeek, return the day of the week
				if(localDate.isAfter(lastWeek) || localDate.isEqual(lastWeek)){
					result = localDate.getDayAsText();
				}
				//if we got here, the localDate is before lastWeek so if it's after twoWeeksAgo, return LAST_WEEK
				else if(localDate.isAfter(twoWeeksAgo) || localDate.isEqual(twoWeeksAgo)){
					result = this.CONST.LAST_WEEK;
				} 
				//if we got here, the localDate is before twoWeeksAgo so if it's after threeWeeksAgo, return TWO_WEEKS_AGO
				else if(localDate.isAfter(threeWeeksAgo) || localDate.isEqual(threeWeeksAgo)){
					result = this.CONST.TWO_WEEKS_AGO;
				}
				//if we got here, the localDate is before threeWeeksAgo so if it's after oneMonthAgo, return THREE_WEEKS_AGO
				else if(localDate.isAfter(oneMonthAgo) || localDate.isEqual(oneMonthAgo)){
					result = this.CONST.THREE_WEEKS_AGO;
				}
				//if we got here the localDate is before oneMonthAgo, so return the month, year
				else {
					result = Mojo.Format.formatDate(localDate, "MMMM yyyy");
				}
			}
		} else {
			//the utcTimestamp is in the future
			if(differenceInDays == -1)
				result = this.CONST.TOMORROW;
			else {
				// getDay() 0 to 6 == Sunday to Saturday
				var days = referencePointDate.getDay();

				//get the week boundaries - these represent the start of the given week - so nextWeek means
				//that everything after this time is next week.
				var nextWeek = referencePointDate.getTime() + ((this.CONST.DAYS_PER_WEEK - days)*this.CONST.DAY_IN_MS);
				var twoWeeksFuture = referencePointDate.getTime() + ((this.CONST.DAYS_PER_WEEK - days + this.CONST.DAYS_PER_WEEK)*this.CONST.DAY_IN_MS);
				var threeWeeksFuture = referencePointDate.getTime() + ((this.CONST.DAYS_PER_WEEK - days + 2*this.CONST.DAYS_PER_WEEK)*this.CONST.DAY_IN_MS);
				var oneMonthFuture = referencePointDate.getTime() + ((this.CONST.DAYS_PER_WEEK - days + 3*this.CONST.DAYS_PER_WEEK)*this.CONST.DAY_IN_MS);
				
				//if the localDate is before nextWeek, return the day of the week
				if(localDate.isBefore(nextWeek)){
					result = localDate.getDayAsText();
				}
				//if we got here, the localDate is after nextWeek so if it's before twoWeeksFuture, return NEXT_WEEK
				else if(localDate.isBefore(twoWeeksFuture)){
					result = this.CONST.NEXT_WEEK;
				} 
				//if we got here, the localDate is after twoWeeksFuture so if it's before threeWeeksFuture, return TWO_WEEKS_FROM_NOW
				else if(localDate.isBefore(threeWeeksFuture)){
					result = this.CONST.TWO_WEEKS_FROM_NOW;
				}
				//if we got here, the localDate is after threeWeeksFuture so if it's before oneMonthFuture, return THREE_WEEKS_FROM_NOW
				else if(localDate.isBefore(oneMonthFuture)){
					result = this.CONST.THREE_WEEKS_FROM_NOW;
				}
				//if we got here the localDate is after oneMonthFuture, so return the month, year
				else {
					result = Mojo.Format.formatDate(localDate, "MMMM yyyy"); 
				}
			}
		}
		
		return result;
	}
};
