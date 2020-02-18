import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ActionCreators } from '../../actions/index';
import { bindActionCreators } from 'redux';
import { View, Text, Alert } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import styles from './styles';

class OfflineNotice extends PureComponent {

    constructor(props) {
        super(props)

        this.state = {
        }
    }

    componentDidMount() {
        const unsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);
        
    }

    componentWillUnmount() {
        const unsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);
        unsubscribe();
    }

    handleConnectivityChange = state => {
        if (state.isConnected) {
            console.log("Internet check : Connection ")
            this.props.setOnlineStatus(state.isConnected)
        } else {
            console.log("Internet check : No connection ")
            this.props.setOnlineStatus(state.isConnected)
        }
    };

    renderOfflineView() {
        return (
            <View style={styles.offlineContainer}>
                <Text style={styles.offlineText}>{'No Internet Connection'}</Text>
            </View>
        );
    }

    render() {
        if (!this.props.isOnline) {
            return this.renderOfflineView();
        } else {
            return null;
        }
    }
}

function mapStateToProps(state) {
    return {
        isOnline: state.home.isOnline,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(OfflineNotice);