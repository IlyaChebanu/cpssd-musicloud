import React, { memo, useState } from "react";
import { View, ActivityIndicator } from 'react-native';
import styles from './styles';

const Spinner = memo(({
    color
}) => {
    const [colour, setColour] = useState(color);

    return (
        <View pointerEvents="none" style={styles.activityIndicator}>
            <ActivityIndicator size='large' color={this.state.colour} />
        </View>
    )
})

export default SongFeedCard;