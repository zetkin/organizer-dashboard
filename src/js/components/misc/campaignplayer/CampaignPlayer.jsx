import React from 'react/addons';

import Transport from './Transport';


export default class CampaignPlayer extends React.Component {
    constructor(props) {
        super(props);

        const startDate = props.actions.length?
            new Date(props.actions[0].start_time) : null;

        this.state = {
            playing: true,
            time: startDate? startDate.getTime() : 0
        };
    }

    componentWillReceiveProps(nextProps) {
        const actions = nextProps.actions;

        if (actions.length) {
            const startDate = new Date(actions[0].start_time);
            const endDate = new Date(actions[actions.length-1].end_time);

            if (this.state.time < startDate.getTime()) {
                this.setState({
                    playing: false,
                    time: startDate.getTime()
                });

                cancelAnimationFrame(this.rafId);
            }
            else if (this.state.time > endDate.getTime()) {
                this.setState({
                    playing: false,
                    time: endDate.getTime()
                });

                cancelAnimationFrame(this.rafId);
            }
        }
        else {
            cancelAnimationFrame(this.rafId);
        }
    }

    componentDidMount() {
        const centerLat = this.props.centerLat;
        const centerLng = this.props.centerLng;
        const ctrDOMNode = React.findDOMNode(this.refs.mapContainer);
        const mapOptions = {
            center: { lat: centerLat, lng: centerLng },
            zoom: 11
        };

        this.map = new google.maps.Map(ctrDOMNode, mapOptions);
        this.heatmap = new google.maps.visualization.HeatmapLayer({
            data: [],
            map: this.map,
            maxIntensity: 1.5,
            radius: 50
        });

        if (this.props.actions.length) {
            this.play();
        }
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.rafId);
    }

    render() {
        var d = new Date(this.state.time);

        const actions = this.props.actions;
        const startTime = actions.length?
            new Date(actions[0].start_time).getTime() : 0;
        const endTime = actions.length?
            new Date(actions[actions.length-1].end_time).getTime() : 0;

        return (
            <div className="campaignplayer">
                <h1>{ d.toUTCString() }</h1>
                <div className="heatmap" ref="mapContainer"/>
                <Transport time={ this.state.time }
                    startTime={ startTime } endTime={ endTime }
                    onPlay={ this.onPlay.bind(this) }
                    onStop={ this.onStop.bind(this) }
                    onScrubBegin={ this.onScrubBegin.bind(this) }
                    onScrubEnd={ this.onScrubEnd.bind(this) }
                    onScrub={ this.onScrub.bind(this) }/>
            </div>
        );
    }

    onScrubBegin() {
        this.wasPlaying = this.state.playing;
        this.stop();
    }

    onScrubEnd() {
        if (this.wasPlaying) {
            this.wasPlaying = undefined;

            this.play();
        }
    }

    onScrub(time) {
        this.setState({
            time: time
        });

        this.redrawHeatMap();
    }

    onPlay(ev) {
        if (!this.state.playing) {
            const actions = this.props.actions;
            const endDate = new Date(actions[actions.length-1].end_time);

            if (this.state.time >= endDate.getTime()) {
                const startDate = new Date(actions[0].start_time);
                this.play(startDate.getTime());
            }
            else {
                this.play();
            }
        }
    }

    onStop(ev) {
        this.stop();
    }

    redrawHeatMap() {
        const time = this.state.time;
        const actions = this.props.actions;
        const locations = this.props.locations;
        const cooldown = 8 * 60 * 60 * 1000;

        var i ;
        var locationWeights = {};

        for (i = 0; i < actions.length; i++) {
            var action = actions[i];
            var loc = action.location;
            var actionStartTime = new Date(action.start_time).getTime();
            var actionEndTime = new Date(action.end_time).getTime();

            if (time > actionStartTime) {
                if (time < (actionEndTime + cooldown)) {
                    locationWeights[loc.id] = 1.0 - (time - actionEndTime) / cooldown;
                }
                else {
                    delete locationWeights[loc.id];
                }
            }
        }

        var points = [];
        var locId;
        for (locId in locationWeights) {
            var n;
            var loc = locations.find(l => l.id == locId);

            points.push({
                location: new google.maps.LatLng(loc.lat, loc.lng),
                weight: locationWeights[locId]
            });
        }

        this.heatmap.setData(points);
    }

    play(startTime) {
        this.prevStamp = undefined;
        const updateTime = (function updateTime(stamp) {
            const ds = this.prevStamp? (stamp - this.prevStamp) : 1/60;
            const tf = ds / (1000/60);
            const newTime = this.state.time + (tf * 1000000);

            const actions = this.props.actions;
            const endDate = new Date(actions[actions.length-1].end_time);

            if (startTime !== undefined) {
                this.setState({
                    playing: true,
                    time: startTime
                });

                startTime = undefined;
                this.redrawHeatMap();
                this.rafId = requestAnimationFrame(updateTime.bind(this));
            }
            else if (newTime < endDate.getTime()) {
                this.setState({
                    playing: true,
                    time: newTime
                });

                this.redrawHeatMap();
                this.rafId = requestAnimationFrame(updateTime.bind(this));
            }
            else {
                this.setState({
                    playing: false,
                    time: endDate.getTime()
                });
            }

            this.prevStamp = stamp;
        }).bind(this);

        updateTime();
    }

    stop() {
        cancelAnimationFrame(this.rafId);

        this.setState({
            playing: false
        });
    }
}

CampaignPlayer.propTypes = {
    actions: React.PropTypes.array
};
