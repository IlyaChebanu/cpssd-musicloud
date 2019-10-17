import React from 'react'
import PropTypes from 'prop-types'
import styles from './InputField.module.scss';

const InputField = props => {
    return <input className={styles.input} type={props.password ? 'password' : 'text'} name={props.name} placeholder={props.placeholder}/>
}

InputField.propTypes = {
    name: PropTypes.string,
    placeholder: PropTypes.string,
    password: PropTypes.bool,
}

export default InputField

