import React, { VFC } from 'react';
import { css } from '@emotion/css';
import { TCanvas } from '../three/TCanvas';
import { LinkIconButton } from './LinkIconButton';
import { ProgressBar } from './ProgressBar';

export const App: VFC = () => {
	return (
		<div className={styles.container}>
			<TCanvas />
			<ProgressBar />
			<LinkIconButton imagePath="/assets/icons/github.svg" linkPath="https://github.com/nemutas/r3f-monopo" />
		</div>
	)
}

const styles = {
	container: css`
		position: relative;
		width: 100vw;
		height: 100vh;
	`
}
