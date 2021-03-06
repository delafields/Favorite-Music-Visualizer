import axios from 'axios';
import request from 'request';

import {
	formatArtistResponse,
	formatTrackResponse,
	formatFeaturesResponse
} from '../utils/format_response';

import {
	shortTermArtistsOptions,
	medTermArtistsOptions,
	longTermArtistsOptions,
	shortTermTracksOptions,
	medTermTracksOptions,
	longTermTracksOptions,
	featuresOptions
} from '../utils/spotify_endpoints';

import {
	FETCH_USER,
	FETCH_TRACK_DATA,
	FETCH_TRACK_SUCCESS,
	FETCH_TRACK_FAILURE,
	FETCH_ARTIST_DATA,
	FETCH_ARTIST_SUCCESS,
	FETCH_ARTIST_FAILURE
} from './types';

export const fetchUser = () => async dispatch => {
	const res = await axios.get('/api/current_user');

	dispatch({ type: FETCH_USER, payload: res.data });
};

export function fetchTracksData() {
	return {
		type: FETCH_TRACK_DATA
	};
}

export function fetchTracksSuccess(data) {
	return {
		type: FETCH_TRACK_SUCCESS,
		data
	};
}

export function fetchTracksFailure() {
	return {
		type: FETCH_TRACK_FAILURE
	};
}

export function trackThunk() {
	return dispatch => {
		dispatch(fetchTracksData());

		axios.get('/api/refresh_token').then(response => {
			const { access_token } = response.data;
			const authHeader = { Authorization: `Bearer ${access_token}` };
			const featuresURL = `https://api.spotify.com/v1/audio-features/?ids=`;

			shortTermTracksOptions['headers'] = authHeader;
			medTermTracksOptions['headers'] = authHeader;
			longTermTracksOptions['headers'] = authHeader;
			featuresOptions['headers'] = authHeader;

			let trackData = {};

			request.get(shortTermTracksOptions, (error, response, body) => {
				if (error) {
					dispatch(fetchTracksFailure());
				}
				let result = formatTrackResponse(body.items);
				trackData.shortTermTracks = result[0];
				trackData.shortTermTrackPopularity = result[1];

				let trackIDs = result[2];
				featuresOptions['url'] = `${featuresURL}${trackIDs}`;

				request.get(featuresOptions, (error, response, body) => {
					if (error) {
						dispatch(fetchTracksFailure());
					}

					trackData.shortTermAudioFeatures = formatFeaturesResponse(
						response.body.audio_features
					);
				});
				//dispatch(fetchTracksSuccess(trackData));
			});

			request.get(medTermTracksOptions, (error, response, body) => {
				if (error) {
					dispatch(fetchTracksFailure());
				}

				let result = formatTrackResponse(body.items);
				trackData.medTermTracks = result[0];
				trackData.medTermTrackPopularity = result[1];

				let trackIDs = result[2];
				featuresOptions['url'] = `${featuresURL}${trackIDs}`;
				request.get(featuresOptions, (error, response, body) => {
					if (error) {
						dispatch(fetchTracksFailure());
					}
					trackData.medTermAudioFeatures = formatFeaturesResponse(
						response.body.audio_features
					);
				});

				//dispatch(fetchTracksSuccess(trackData));
			});

			request.get(longTermTracksOptions, (error, response, body) => {
				if (error) {
					dispatch(fetchTracksFailure());
				}

				let result = formatTrackResponse(body.items);
				trackData.longTermTracks = result[0];
				trackData.longTermTrackPopularity = result[1];

				let trackIDs = result[2];
				featuresOptions['url'] = `${featuresURL}${trackIDs}`;
				request.get(featuresOptions, (error, response, body) => {
					if (error) {
						dispatch(fetchTracksFailure());
					}
					trackData.longTermAudioFeatures = formatFeaturesResponse(
						response.body.audio_features
					);
					dispatch(fetchTracksSuccess(trackData));
				});

				//dispatch(fetchTracksSuccess(trackData));
			});
		});
	};
}

export function fetchArtistsData() {
	return {
		type: FETCH_ARTIST_DATA
	};
}

export function fetchArtistsSuccess(data) {
	return {
		type: FETCH_ARTIST_SUCCESS,
		data
	};
}

export function fetchArtistsFailure() {
	return {
		type: FETCH_ARTIST_FAILURE
	};
}

export function artistThunk() {
	return dispatch => {
		dispatch(fetchArtistsData());
		axios.get('/api/refresh_token').then(response => {
			const { access_token } = response.data;
			const authHeader = { Authorization: `Bearer ${access_token}` };

			shortTermArtistsOptions['headers'] = authHeader;
			medTermArtistsOptions['headers'] = authHeader;
			longTermArtistsOptions['headers'] = authHeader;

			let artistData = {};

			request.get(shortTermArtistsOptions, (error, response, body) => {
				if (error) {
					dispatch(fetchArtistsFailure());
				}

				let result = formatArtistResponse(body.items);
				artistData.shortTermArtists = result[0];
				artistData.shortTermGenres = result[1];
				artistData.shortTermExtraGenres = result[2];
				artistData.shortTermArtistPopularity = result[3];

				dispatch(fetchArtistsSuccess(artistData));
			});

			request.get(medTermArtistsOptions, (error, response, body) => {
				if (error) {
					dispatch(fetchArtistsFailure());
				}

				let result = formatArtistResponse(body.items);
				artistData.medTermArtists = result[0];
				artistData.medTermGenres = result[1];
				artistData.medTermExtraGenres = result[2];
				artistData.medTermArtistPopularity = result[3];

				dispatch(fetchArtistsSuccess(artistData));
			});

			request.get(longTermArtistsOptions, (error, response, body) => {
				if (error) {
					dispatch(fetchArtistsFailure());
				}

				let result = formatArtistResponse(body.items);
				artistData.longTermArtists = result[0];
				artistData.longTermGenres = result[1];
				artistData.longTermExtraGenres = result[2];
				artistData.longTermArtistPopularity = result[3];

				dispatch(fetchArtistsSuccess(artistData));
			});
		});
	};
}
