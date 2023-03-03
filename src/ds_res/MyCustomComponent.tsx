import React from "react";
import './MyCustomComponent.scss';
import cn from 'classnames';
import * as echarts from 'echarts';
import {MyService} from "../services/MyService";
import {ThemeVC} from "bi-internal/services";
import {UrlState} from "bi-internal/core";

export default class MyCustomComponent extends React.Component<any> {
  private _myService: MyService;
  private _urlService: UrlState;
  public _chart: any = null;
  public state: {
    data: any;
    theme: any;
    NameFilters: any;
    isChecked: boolean;
  };

  public constructor(props) {
    super(props);
    this.state = {
      data: [],
      theme: {},
      NameFilters: ["Платные услуги","ОМС","ДМС","Бюджет","Личный шифр"],
      isChecked: true
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
    const koob = cfg.getRaw().dataSource.koob || "luxmsbi.custom_2_pro_org";
    const filters = cfg.getRaw().dataSource?.filters || {};
    if (model.loading || model.error) return;
    this._myService.getKoobDataByCfg({
      with: koob,
      columns: [
        'name'
      ],
      /*filters: {
        ...model.filters,
      },*/
      distinct: [
        'name'
      ]
    }).then(data => {
      console.log(data);
      this.setState({data: data});
    })
  }
  public componentWillUnmount() {
    ThemeVC.getInstance().unsubscribe(this._onThemeVCUpdated);
  }

  public onChange(value){
    var filters = this.state.NameFilters;
    var index = filters.indexOf(value);
    if (index !== -1) filters.splice(index, 1);
    else filters.push(value);
    this.setState({
      CheckFilters: filters,
      isChecked: !this.state.isChecked
    });
    filters = {name:['='].concat(filters)};
    this._myService.setFilters(filters);
  }

  public render() {
    const { data, theme} = this.state;
    console.log(data);
    return (
      <div className="CheckBoxPanel">
        <div className="CheckBoxPanel">
          <div className="CheckBoxPanel__item__title">Список расходов</div>
          <div className="CheckBoxPanel__item__list">
            {data.map(el =>
            <div className="CheckBoxPanel__item__checkbox">
              <input className="CheckBoxName" type="checkbox" defaultChecked={this.state.isChecked} value={el.name} onChange={() => this.onChange(el.name)}/>
              <label className="CheckBoxLabel">{el.name}</label>
             </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}