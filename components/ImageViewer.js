import React, { Component } from 'react';
import Icon from '@material-ui/core/Icon';
import Zoom from '@material-ui/core/Zoom';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  root: {
    height: "100%",
    display: "flex",
    cursor: "pointer",
    alignItems: "center",
    backgroundColor: "black",
    justifyContent: "space-between",
  },
  img: {
    userSelect: "none",
    height: "100%",
    pointerEvents: "none"
  },
  arrowRight: { 
    opacity: 0.5,
    marginRight: "10px", 
    pointerEvents: "none"
  },
  arrowLeft: { 
    opacity: 0.5,
    marginLeft: "10px",
    pointerEvents: "none"
  },
  watermarkLeft:{
    position: "absolute",
    left: "15px",
    bottom: "5px" 
  },
  watermarkRight:{
    position: "absolute",
    right: "15px",
    bottom: "5px" 
  },
  spinner: {
    color: 'dimgray',
    animationDuration: '550ms',
    position: 'absolute',
    top: "20px",
    right: "13px"
  },
  download: { 
    top: "20px",
    left: "48px",
    opacity: 0.5,
    position: "absolute"
  },
  play: { 
    top: "20px",
    left: "24px",
    opacity: 0.5,
    position: "absolute"
  }

});

class ImageViewer extends Component {
  state = { 
    activeStep: 0,
    imageLoading: true
  };

  headerButtons = ["download", "play", "pause"]
  showNextImage = this.showNextImage.bind(this);

  handleNext = step => {
    this.setState(({ activeStep }) => ({ activeStep: activeStep + step }));
    this.setState({ imageLoading: true })
  };

  clickImage = (e, num_samples) => {
    const { activeStep } = this.state
    const { offsetX } = e.nativeEvent
    const { offsetWidth } = e.target
    const className = e.target.className
    
    if (!this.headerButtons.some(iconName => className.includes(iconName))) {
      if (offsetX > offsetWidth / 2) {
        if (activeStep < num_samples - 1) {
          this.handleNext(+1)
        }
      } else {
        if (activeStep > 0) {
          this.handleNext(-1)
        }
      }
    }
  }

  showNextImage () {
    const { timestamps } = this.props
    this.setState(({ activeStep }) => ({ 
      activeStep: activeStep < timestamps.length - 1 ? activeStep + 1 : 0,
      imageLoading: true
    }))
    
  }

  autoPlay () {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    } else {
      this.showNextImage()
      this.interval = setInterval(this.showNextImage, 5000);
    }
    this.setState(({ autoplayToggled }) => ({ autoplayToggled: !autoplayToggled }))
  } 
  
  render () {
    const { imagePaths, timestamps, classes } = this.props;
    const { activeStep, hoverImg, imageLoading, autoplayToggled } = this.state;
    
    return (
      <div 
        className={classes.root}
        onClick={e => this.clickImage(e, timestamps.length)}
        onMouseEnter={() => this.setState({ hoverImg: true })}
        onMouseLeave={() => this.setState({ hoverImg: false })}
      >

        <Zoom in={hoverImg} timeout={200}>
          <div className={classes.arrowLeft}>
            <Icon className='fa fa-chevron-left imgBtn' />
          </div>
        </Zoom>

        <img
          className={classes.img}
          src={imagePaths[activeStep]}
          onLoad={() => this.setState({ imageLoading: false })}
        />

        {imageLoading && <CircularProgress
          size={24}
          thickness={4}
          className={classes.spinner}
        />}

        <p className={classes.watermarkRight}>{timestamps[activeStep]}</p>
        <p className={classes.watermarkLeft}>{`${activeStep}/${timestamps.length}`}</p>

        <Zoom in={hoverImg} timeout={{ enter: 1000, exit:1500 }}>
          <a download
            className={classes.download} 
            href={imagePaths[activeStep]}
          >
            <Icon className='fa fa-download imgBtn' />
          </a>
        </Zoom>

        <Zoom in={hoverImg} timeout={{ enter: 1000, exit:1500 }}>
          <span className={classes.play}>
            <Icon 
              onClick={() => this.autoPlay()}
              className={autoplayToggled ? 'fa fa-pause imgBtn' : 'fa fa-play imgBtn'}/>
          </span>
        </Zoom>

        <Zoom in={hoverImg} timeout={200}>
          <div className={classes.arrowRight}>
            <Icon className='fa fa-chevron-right imgBtn' />
          </div>
        </Zoom>
        
      </div>
    );
  }
}

export default withStyles(styles)(ImageViewer);
