
import {Pipe, PipeTransform} from '@angular/core';


@Pipe({
    name: 'timeAgo',
    pure: true
})


export class TimeAgoPipe implements PipeTransform {
  constructor(){
  
  }
  
    transform(value?: any): any {
        if (value) {
          let offsetedTime;
            offsetedTime = new Date(value).getTime();
            const seconds = Math.floor((+new Date() - +offsetedTime) / 1000);
            if (seconds < 29) // less than 30 seconds ago will show as 'Just now'
                return 'Just now';
            // if(seconds > 2592000){
            //   return this.datepipe.transform(offsetedTime, 'MMM d, y, h:mm:ss a');
            // }
            const intervals = {
                'year': 31536000,
                'month': 2592000,
                'week': 604800,
                'day': 86400,
                'hour': 3600,
                'minute': 60,
                'second': 1
            };
            let counter;
            for (const i in intervals) {
                counter = Math.floor(seconds / intervals[i]);
                if (counter > 0)
                    if (counter === 1) {
                        return counter + ' ' + i + ' ago'; // singular (1 day ago)
                    } else {
                        return counter + ' ' + i + 's ago'; // plural (2 days ago)
                    }
            }
        }
        return value;
    }

}
