import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowMinimize, faWindowMaximize, faWindowRestore, faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { AliasObject } from './share-types';
import './title-bar.sass';

type WindowStates = {
  isMaximized: boolean;
};

class TitleBar extends React.Component<AliasObject, WindowStates> {
  readonly state: WindowStates = {
    isMaximized: false
  };

  constructor(props: AliasObject) {
    super(props);

    this.minimize = this.minimize.bind(this);
    this.maxUnmax = this.maxUnmax.bind(this);
    this.close = this.close.bind(this);
  }

  minimize(): void {
    if (window.winApi) window.winApi.minimizeWindow();
  }

  maxUnmax(): void {
    if (window.winApi) {
      window.winApi.maxUnmaxWindow();

      this.setState({
        isMaximized: window.winApi.isWindowMaximized()
      });
    }
  }

  close(): void {
    if (window.winApi)
      window.winApi.closeWindow();
  }

  render(): JSX.Element {
    return (
      <div className="title-bar">
        <TitleArea
          icon="../assets/icons/calculator.png"
          appName="Calculaor"
        />
        <div className="control-area">
          <button onClick={this.minimize}><FontAwesomeIcon icon={faWindowMinimize} /></button>
          <button onClick={this.maxUnmax}>
            {
              this.state.isMaximized ?
                <FontAwesomeIcon icon={faWindowRestore} /> :
                <FontAwesomeIcon icon={faWindowMaximize} />
            }
          </button>
          <button onClick={this.close}><FontAwesomeIcon icon={faWindowClose} /></button>
        </div>
      </div>
    );
  }
}

type TitleAreaProps = {
  icon: string;
  appName: string;
};
const TitleArea = ({icon, appName}: TitleAreaProps) => (
  <div className="title-area">
    <div className="app-icon"><img src={icon} /></div>
    <div className="app-name">{appName}</div>
  </div>
);

export default TitleBar;