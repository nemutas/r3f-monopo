import React, { Suspense, VFC } from 'react';
import { Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { BackgroundSphere } from './BackgroundSphere';
import { InnerGeometries } from './InnerGeometries';
import { Loading } from './Loading';
import { ConstantNoisePass } from './postprocessing/ConstantNoisePass';
import { Effects } from './postprocessing/Effects';
import { FXAAPass } from './postprocessing/FXAAPass';

export const TCanvas: VFC = () => {
	return (
		<Canvas
			camera={{
				position: [0, 0, 1.3],
				fov: 50,
				aspect: window.innerWidth / window.innerHeight,
				near: 0.1,
				far: 2000
			}}
			dpr={window.devicePixelRatio}>
			{/* objects */}
			<Suspense fallback={<Loading />}>
				<BackgroundSphere />
				<InnerGeometries />
			</Suspense>
			{/* effects */}
			<Effects sRGBCorrection={false}>
				<FXAAPass />
				<ConstantNoisePass />
			</Effects>
			{/* helper */}
			<Stats />
		</Canvas>
	)
}
