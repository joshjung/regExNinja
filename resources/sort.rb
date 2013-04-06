require 'set'

CHUNK_SIZE = 1024
SOURCE_FILE = 'amusements-in-mathematics.txt'

File.open(SOURCE_FILE) do |file|
  
  word_set = Set.new

  until file.eof?
    chunk = file.read(CHUNK_SIZE)
    chunk_word_array = chunk.scan(/[a-zA-Z][a-z]+/)
    chunk_word_array.each { |word| word_set.add(word.downcase) if word.length > 2 }
  end

  word_set_string = word_set.to_a * ', '
  word_set_string = "[ #{ word_set_string } ]"

  File.open('word_set.txt', 'w') { |file| file.write(word_set_string) }

end
