import { useEffect, VFC } from 'react';
import { loadState } from '../modules/store';

export const Loading: VFC = () => {
	useEffect(() => {
		return () => {
			// console.log('Complete!')
			loadState.completed = true
		}
	}, [])
	return null
}
