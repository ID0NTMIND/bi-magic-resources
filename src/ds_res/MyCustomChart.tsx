import React from "react";
import './MyCustomChart.scss';
import cn from 'classnames';
import * as echarts from  'echarts';
import {MyService} from "../services/MyService";
import {ThemeVC} from "bi-internal/services";
import {UrlState} from "bi-internal/core";

export default class MyCustomChart extends React.Component<any> {
  private _myService: MyService;
  private _urlService: UrlState;
  public _chart: any = null;
  public state: {
    data: any;
    theme: any;
  };

  public constructor(props) {
    super(props);
    this.state = {
      data: [],
      theme: {}
    };
  }

  public componentDidMount(): void {
    ThemeVC.getInstance().subscribeUpdatesAndNotify(this._onThemeVCUpdated);
    const {cfg} = this.props;
    const koob = cfg.getRaw().koob;
    this._myService = MyService.createInstance(koob);
    this._myService.subscribeUpdatesAndNotify(this._onSvcUpdated);
  }
  private _onThemeVCUpdated = (themeVM): void => {
    if (themeVM.error || themeVM.loading) return;
    this.setState({theme: themeVM.currentTheme});
  }
  private _onSvcUpdated = (model) => {
    const {cfg} = this.props;
    const koob = cfg.getRaw().koob || "luxmsbi.custom_2_pro_org";
    const filters = cfg.getRaw().dataSource?.filters || {};
    if (model.loading || model.error) return;
    this._myService.getKoobDataByCfg({
      with: koob,
      columns: [
        'org_name',
        'sum(value)'
      ],
      filters: {
        ...model.filters,
      }
    }).then(data => {
      console.log(data);
      this.setState({data: data});
    })
  }
  public componentWillUnmount() {
    ThemeVC.getInstance().unsubscribe(this._onThemeVCUpdated);
  }


  public render() {
    const { data, theme} = this.state;
    console.log('Чекаем данные для графика');
    console.log(data);
    const useEcharts = () => {
      var chartDom = document.getElementById('chart');
      let myChart = echarts.init(chartDom, null, { renderer: "svg" });
      var option;
      
      option = {
        legend:  {},
        tooltip: {},
        dataset: {      
          dimensions: ['org_name', 'value'],
          source: data
        },
        xAxis: { type: 'category' },
        yAxis: {},
        series: [{name:'Общие расходы', type: 'bar' }]
      };

      option && myChart.setOption(option);
    };

    return (
      <div className="Main">
        <div id="chart" className="stylechart" ref={() => useEcharts()}></div>
      </div>
    );
  }
}