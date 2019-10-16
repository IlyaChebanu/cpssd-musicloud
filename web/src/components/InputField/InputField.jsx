import React from 'react'
import PropTypes from 'prop-types'
import styles from './InputField.module.scss';

const InputField = props => {
    return <input className={styles.input} type="text" name={props.name} placeholder={props.placeholder}/>
}

InputField.propTypes = {
    name: PropTypes.string,
    placeholder: PropTypes.string
}

export default InputField

