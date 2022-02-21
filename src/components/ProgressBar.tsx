import gsap from 'gsap';
import React, { useEffect, VFC } from 'react';
import { useSnapshot } from 'valtio';
import { css, cx } from '@emotion/css';
import { loadState } from '../modules/store';

export const ProgressBar: VFC = () => {
	const loadSnap = useSnapshot(loadState)

	useEffect(() => {
		if (loadSnap.completed) {
			gsap.to('.progress-animation', { width: '100%', ease: 'none', duration: 10, repeat: -1 })
		}
	}, [loadSnap])

	return <div className={cx(styles.progressBar, 'progress-animation')} />
}

const styles = {
	progressBar: css`
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0%;
		height: 10px;
		background-color: rgba(255, 255, 255, 0.3);
		border-top-right-radius: 5px;
		border-bottom-right-radius: 5px;
	`
}
