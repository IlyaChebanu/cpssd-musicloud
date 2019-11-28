import React from 'react';
import styles from './Dropdown.module.scss';


class Dropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      displayMenu: false,
      props,
    };
    this.showDropdownMenu = this.showDropdownMenu.bind(this);
    this.hideDropdownMenu = this.hideDropdownMenu.bind(this);
    this.toDoList = this.setDropdown.bind(this);
  }


  setDropdown() {
    return this.state.props.items.map((item) => (
      <li onClick={item.action}>
        <img className={styles.icon} src={item.icon} />
        <p>{item.name}</p>
      </li>
    ));
  }


  showDropdownMenu(event) {
    event.preventDefault();
    this.setState({ displayMenu: true }, () => {
      document.addEventListener('click', this.hideDropdownMenu);
    });
  }

  hideDropdownMenu() {
    this.setState({ displayMenu: false }, () => {
      document.removeEventListener('click', this.hideDropdownMenu);
    });
  }


  render() {
    return (
      <div className={styles.dropdown} style={{ width: '50px' }}>
        <div className={styles.button} onClick={this.showDropdownMenu}>{this.state.props.title}</div>

        {this.state.displayMenu ? (
          <ul>
            {this.toDoList()}
          </ul>
        )
          : (
            null
          )}

      </div>

    );
  }
}

export default Dropdown;
