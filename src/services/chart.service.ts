import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {URL} from 'url';

interface IDatasets {
  datasets: {
    labels: string[],
    data: number[],
  },
}

@injectable({scope: BindingScope.TRANSIENT})
export class ChartService {
  constructor(/* Add @inject to inject parameters */) { }

  /*
   * Add service methods here
   */
  public async getChartDatasets(allData: any[], urlString: string): Promise<IDatasets> {
    const paramsFromUrl = new URL(`${process.env.SERVER_ROOT_URI}${urlString}`).searchParams

    const label = paramsFromUrl.get('label')!;

    let data: any = {};

    for (let resultIndex = 0; resultIndex < allData.length; resultIndex++) {
      const element: any = allData[resultIndex];

      if (label.split('.').length) {

        const labelArray = label.split('.');
        const elementLabel = element[labelArray[0]] && element[labelArray[0]][labelArray[1]];

        if (elementLabel) data[elementLabel] = ((data[elementLabel] || 0) + 1);
      } else {

        const elementLabel = element[label];

        if (elementLabel) data[elementLabel] = ((elementLabel || 0) + 1);
      }
    };

    return {
      datasets: {
        labels: Object.keys(data),
        data: Object.values(data),
      }
    }
  }

  public async getChartDetails(allData: any[], urlString: string): Promise<any[]> {
    const paramsFromUrl = new URL(`${process.env.SERVER_ROOT_URI}${urlString}`).searchParams

    const label = paramsFromUrl.get('label')!;
    const value = paramsFromUrl.get('value')!;

    const data = allData.filter(element => {
      let elementLabel

      if (label.split('.').length) {
        const labelArray = label.split('.');
        elementLabel = element[labelArray[0]] && element[labelArray[0]][labelArray[1]];
      } else {
        elementLabel = element[label];
      }

      return elementLabel === value;
    });

    return data;
  }
}
