import React from 'react';
import {registerIcons} from '@uifabric/styling';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faChevronRight,
    faChevronLeft,
    faChevronDown,
    faChevronUp,
    faCheckCircle,
    faTimesCircle,
    faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';

const iconMap = {
    chevronRight: faChevronRight,
    chevronLeft: faChevronLeft,
    chevronDown: faChevronDown,
    chevronUp: faChevronUp,
    completed: faCheckCircle,
    errorbadge: faTimesCircle,
    info: faInfoCircle,
};

function initialize() {
    const icons = {};
    Object.keys(iconMap).forEach(iconKey => {
        icons[iconKey] = <FontAwesomeIcon icon={iconMap[iconKey]}/>;
    });
    registerIcons({icons});
}

export default {
    initialize,
};