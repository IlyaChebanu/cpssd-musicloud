import { Animated, Easing } from 'react-native';
import React from 'react';

export function animateTimingNative(
    animatedValue,
    value = 1,
    duration = 500,
    easing = Easing.linear,
    delay = 0,
) {
    Animated.timing(animatedValue, {
        toValue: value,
        duration: duration,
        easing: easing,
        delay: delay,
        useNativeDriver: true,
    }).start();
}

export async function animateTimingPromiseNative(
    animatedValue,
    value = 1,
    duration = 500,
    easing = Easing.linear,
    delay = 0,
) {
    return new Promise(resolve => {
        Animated.timing(animatedValue, {
            toValue: value,
            duration: duration,
            easing: easing,
            delay: delay,
            useNativeDriver: true,
        }).start(() => resolve(true));
    });
}

export function animateCustomLoginNative(
    animatedValueArr,
    arr,
    value = 1,
    duration = 500,
    easing = Easing.linear,
    delay = 75
) {
    return new Promise(resolve => {
        animateTimingPromiseNative(animatedValueArr[arr[0]], value, duration, easing).then(setTimeout(function () {
            animateTimingPromiseNative(animatedValueArr[arr[1]], value, duration, easing).then(() => resolve(true))
        }, delay))
    })
}

export function animateCustomRegisterNative(
    animatedValueArr,
    arr,
    value = 1,
    duration = 500,
    easing = Easing.linear,
    delay = 75
) {
    return new Promise(resolve => {
        animateTimingPromiseNative(animatedValueArr[arr[0]], value, duration, easing).then(setTimeout(function () {
            animateTimingPromiseNative(animatedValueArr[arr[1]], value, duration, easing).then(setTimeout(function () {
                animateTimingPromiseNative(animatedValueArr[arr[2]], value, duration, easing).then(setTimeout(function () {
                    animateTimingPromiseNative(animatedValueArr[arr[3]], value, duration, easing).then(() => resolve(true))
                }, delay))
            }, delay))
        }, delay))
    })
}

export function animateCustomForgotNative(
    animatedValueArr,
    arr,
    value = 1,
    duration = 500,
    easing = Easing.linear,
    delay = 75
) {
    return new Promise(resolve => {
        animateTimingPromiseNative(animatedValueArr[arr[0]], value, duration, easing).then(setTimeout(function () {
            animateTimingPromiseNative(animatedValueArr[arr[1]], value, duration, easing).then(setTimeout(function () {
                animateTimingPromiseNative(animatedValueArr[arr[2]], value, duration, easing).then(() => resolve(true))
            }, delay))
        }, delay))
    })
}