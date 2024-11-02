import styled from 'styled-components'
// import MovieInput from './movie-input'
// import ValidationErrorDisplay from './validation-error-display'
// import {useMovieForm} from '@hooks/use-movie-form'
// import {SButton} from '@styles/styled-components'

export default function MovieForm() {
  return (
    <div data-cy="movie-form-comp">
      <SSubtitle>Add a new movie</SSubtitle>

      {/* <MovieInput type="text" value={} placeholder="Movie" onChange/> */}
      {/* <MovieInput type="text" value={} placeholder="Movie" onChange/> */}
      {/* <MovieInput type="text" value={} placeholder="Movie" onChange/> */}
      {/* <SButton data-cy="add-movie-button"  /> */}
    </div>
  )
}

const SSubtitle = styled.h2`
  color: #333;
  font-size: 2rem;
  margin-bottom: 10px;
`
